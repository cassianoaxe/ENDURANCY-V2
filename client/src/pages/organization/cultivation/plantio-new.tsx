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
import { 
  Leaf, Search, Plus, Filter, MoreVertical, Calendar, Thermometer, Droplet, 
  BarChart2, Info, Trash2, Pencil, CheckCircle, XCircle, AlertTriangle, Calendar as CalendarIcon 
} from 'lucide-react';

const PlantioPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Plantio</h1>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Novo Plantio
          </Button>
        </div>

        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ativos">Plantios Ativos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="sementes">Sementes</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantios..."
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
                  <SelectItem value="germinacao">Germinação</SelectItem>
                  <SelectItem value="vegetativo">Estágio Vegetativo</SelectItem>
                  <SelectItem value="floracao">Floração</SelectItem>
                  <SelectItem value="colheita">Próximo à Colheita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="ativos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card de Plantio 1 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-001</CardTitle>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vegetativo</Badge>
                  </div>
                  <CardDescription>Cannabis Sativa - 15 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Plantio: 15/03/2025</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Prev. colheita: 25/06/2025</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Thermometer className="h-4 w-4 text-red-500 mb-1" />
                        <span>24°C</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Droplet className="h-4 w-4 text-blue-500 mb-1" />
                        <span>65%</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <BarChart2 className="h-4 w-4 text-green-500 mb-1" />
                        <span>32cm</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-500">Atualizado: hoje às 08:15</span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Plantio 2 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-002</CardTitle>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Floração</Badge>
                  </div>
                  <CardDescription>Cannabis Indica - 20 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Plantio: 02/03/2025</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Prev. colheita: 05/06/2025</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Thermometer className="h-4 w-4 text-red-500 mb-1" />
                        <span>23°C</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Droplet className="h-4 w-4 text-blue-500 mb-1" />
                        <span>70%</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <BarChart2 className="h-4 w-4 text-green-500 mb-1" />
                        <span>45cm</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-500">Atualizado: hoje às 07:45</span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Card de Plantio 3 */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Lote CLT-003</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Maturação</Badge>
                  </div>
                  <CardDescription>Cannabis Ruderalis - 12 plantas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Plantio: 20/02/2025</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Prev. colheita: 10/05/2025</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Thermometer className="h-4 w-4 text-red-500 mb-1" />
                        <span>25°C</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <Droplet className="h-4 w-4 text-blue-500 mb-1" />
                        <span>60%</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                        <BarChart2 className="h-4 w-4 text-green-500 mb-1" />
                        <span>68cm</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-xs text-amber-600">Atenção: 2 plantas com sintomas</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="historico">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              O histórico de plantios estará disponível em breve.
            </div>
          </TabsContent>
          
          <TabsContent value="calendario">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              O calendário de plantio estará disponível em breve.
            </div>
          </TabsContent>
          
          <TabsContent value="sementes">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              O gerenciamento de sementes estará disponível em breve.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

// Temporariamente usando o bypass para testes
export default bypassModuleAccess(PlantioPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});