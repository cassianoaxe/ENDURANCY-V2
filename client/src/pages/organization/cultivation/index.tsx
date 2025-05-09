import React from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, Droplet, Thermometer, BarChart, AlertCircle, 
  ArrowUp, ArrowDown, Clock, Calendar, Building, 
  Package, Scissors, FlaskConical, Settings 
} from 'lucide-react';

const CultivationDashboard = () => {
  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Cultivo</h1>
          <span className="text-sm text-gray-500">Última atualização: Hoje às 09:45</span>
        </div>

        {/* Cards de resumo */}
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
                  <p className="text-xs text-green-600"><ArrowUp className="h-3 w-3 inline" /> 12% desde o mês passado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Próximas Colheitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Scissors className="h-8 w-8 text-amber-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-gray-500">Próximos 30 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">5.8kg</p>
                  <p className="text-xs text-red-600"><ArrowDown className="h-3 w-3 inline" /> 8% desde o mês passado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Problemas Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-gray-500">Requerem atenção</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status das estufas */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Estufas</CardTitle>
            <CardDescription>Condições atuais das 3 estufas em operação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Estufa 1 - Vegetativo</span>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center"><Thermometer className="h-4 w-4 text-red-500 mr-1" /> 24°C</div>
                    <div className="flex items-center"><Droplet className="h-4 w-4 text-blue-500 mr-1" /> 65%</div>
                    <div className="flex items-center"><Leaf className="h-4 w-4 text-green-500 mr-1" /> 15 plantas</div>
                  </div>
                </div>
                <Progress value={85} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Otimização: 85%</span>
                  <span>Status: Normal</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="font-medium">Estufa 2 - Floração</span>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center"><Thermometer className="h-4 w-4 text-red-500 mr-1" /> 23°C</div>
                    <div className="flex items-center"><Droplet className="h-4 w-4 text-blue-500 mr-1" /> 70%</div>
                    <div className="flex items-center"><Leaf className="h-4 w-4 text-green-500 mr-1" /> 20 plantas</div>
                  </div>
                </div>
                <Progress value={92} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Otimização: 92%</span>
                  <span>Status: Ótimo</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="font-medium">Estufa 3 - Maturação</span>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center"><Thermometer className="h-4 w-4 text-red-500 mr-1" /> 25°C</div>
                    <div className="flex items-center"><Droplet className="h-4 w-4 text-blue-500 mr-1" /> 60%</div>
                    <div className="flex items-center"><Leaf className="h-4 w-4 text-green-500 mr-1" /> 12 plantas</div>
                  </div>
                </div>
                <Progress value={72} className="h-2 bg-gray-100" />
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-gray-500">Otimização: 72%</span>
                  <span className="text-amber-500">Status: Atenção (umidade)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linha de cards inferiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Atividades</CardTitle>
              <CardDescription>Atividades programadas para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Colheita do lote CLT-003</p>
                    <p className="text-sm text-gray-500">10/05/2025 - Equipe A</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Transplante das mudas (20 unidades)</p>
                    <p className="text-sm text-gray-500">15/05/2025 - Equipe B</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FlaskConical className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Testes de pH e nutrientes</p>
                    <p className="text-sm text-gray-500">06/05/2025 - Laboratório</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Settings className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Manutenção dos sistemas de irrigação</p>
                    <p className="text-sm text-gray-500">12/05/2025 - Equipe Técnica</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Variedade</CardTitle>
              <CardDescription>Rendimento médio das principais variedades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Cannabis Sativa</span>
                    <span className="text-sm text-gray-500">186g/planta</span>
                  </div>
                  <Progress value={83} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Cannabis Indica</span>
                    <span className="text-sm text-gray-500">172g/planta</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Cannabis Ruderalis</span>
                    <span className="text-sm text-gray-500">153g/planta</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Híbrido (Charlotte's Angel)</span>
                    <span className="text-sm text-gray-500">210g/planta</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-gray-500">
              * Baseado nas últimas 5 colheitas de cada variedade
            </CardFooter>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(CultivationDashboard, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});