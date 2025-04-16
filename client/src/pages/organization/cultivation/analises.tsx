import React, { useState } from 'react';
import { withModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, LineChart, PieChart, FilePlus2, Download, Calendar, 
  ChevronDown, Microscope, FlaskConical, Share2, FolderSearch
} from 'lucide-react';

const AnalysisModule = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedType, setSelectedType] = useState('todos');

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Análises do Cultivo</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <FilePlus2 className="h-4 w-4" />
              <span>Novo Relatório</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar Dados</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Plantios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                +12% <span className="text-muted-foreground">vs. período anterior</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rendimento Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 kg/lote</div>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                +5.2% <span className="text-muted-foreground">vs. período anterior</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Teor THC Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.7%</div>
              <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                -0.3% <span className="text-muted-foreground">vs. período anterior</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Teor CBD Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9.5%</div>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                +1.2% <span className="text-muted-foreground">vs. período anterior</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Últimos 7 dias</SelectItem>
                <SelectItem value="mes">Último mês</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="ano">Último ano</SelectItem>
                <SelectItem value="personalizado">Período personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <FolderSearch className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de análise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="quimico">Análise química</SelectItem>
                <SelectItem value="genetico">Análise genética</SelectItem>
                <SelectItem value="rendimento">Rendimento</SelectItem>
                <SelectItem value="resistencia">Resistência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="graficos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="analises-laboratorio">Análises de Laboratório</TabsTrigger>
            <TabsTrigger value="tendencias">Tendências</TabsTrigger>
            <TabsTrigger value="comparativo">Comparativo de Strains</TabsTrigger>
          </TabsList>
          
          <TabsContent value="graficos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rendimento por Lote</CardTitle>
                  <CardDescription>Comparativo dos últimos 10 lotes colhidos</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                    <div className="flex flex-col items-center">
                      <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-muted-foreground text-sm">Gráfico de rendimento por lote</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Concentração de Canabinoides</CardTitle>
                  <CardDescription>Níveis de THC, CBD e outros canabinoides por lote</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                    <div className="flex flex-col items-center">
                      <LineChart className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-muted-foreground text-sm">Gráfico de concentração de canabinoides</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Espécie</CardTitle>
                  <CardDescription>Distribuição de cultivos por espécie de cannabis</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                    <div className="flex flex-col items-center">
                      <PieChart className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-muted-foreground text-sm">Gráfico de distribuição por espécie</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parâmetros Ambientais</CardTitle>
                  <CardDescription>Temperatura, umidade e luminosidade ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                    <div className="flex flex-col items-center">
                      <LineChart className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-muted-foreground text-sm">Gráfico de parâmetros ambientais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analises-laboratorio">
            <Card>
              <CardHeader>
                <CardTitle>Análises Laboratoriais</CardTitle>
                <CardDescription>Resultados de testes realizados em amostras dos lotes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID Análise</th>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Data</th>
                        <th scope="col" className="px-6 py-3">Tipo de Teste</th>
                        <th scope="col" className="px-6 py-3">Responsável</th>
                        <th scope="col" className="px-6 py-3">Resultado</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">AN-2025-042</th>
                        <td className="px-6 py-4">CLT-0095</td>
                        <td className="px-6 py-4">12/04/2025</td>
                        <td className="px-6 py-4">Perfil de Canabinoides</td>
                        <td className="px-6 py-4">Dr. Marina Silva</td>
                        <td className="px-6 py-4">Aprovado</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Microscope className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">AN-2025-041</th>
                        <td className="px-6 py-4">CLT-0094</td>
                        <td className="px-6 py-4">05/04/2025</td>
                        <td className="px-6 py-4">Microbiológico</td>
                        <td className="px-6 py-4">Dr. João Santos</td>
                        <td className="px-6 py-4">Aprovado</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Microscope className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">AN-2025-040</th>
                        <td className="px-6 py-4">CLT-0093</td>
                        <td className="px-6 py-4">20/03/2025</td>
                        <td className="px-6 py-4">Metais Pesados</td>
                        <td className="px-6 py-4">Dra. Carla Mendes</td>
                        <td className="px-6 py-4">Aprovado</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Microscope className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share2 className="h-4 w-4" />
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
          
          <TabsContent value="tendencias">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              A análise de tendências estará disponível em breve.
            </div>
          </TabsContent>
          
          <TabsContent value="comparativo">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              O comparativo de strains estará disponível em breve.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default withModuleAccess(AnalysisModule, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});