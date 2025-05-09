import React from 'react';
import { withModuleAccess, bypassModuleAccess } from '@/components/modules/withModuleAccess';

import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, FlowerIcon, Sun, Cloud, Droplet, Thermometer } from 'lucide-react';

const CultivationModule = () => {
  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Cultivo</h1>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="batches">Lotes</TabsTrigger>
            <TabsTrigger value="plants">Plantas</TabsTrigger>
            <TabsTrigger value="records">Registros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FlowerIcon className="h-5 w-5 text-green-600" />
                    Plantas Ativas
                  </CardTitle>
                  <CardDescription>Total de plantas em cultivo ativo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">42</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Lotes Ativos
                  </CardTitle>
                  <CardDescription>Total de lotes em cultivo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">8</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-amber-500" />
                    Condições Atuais
                  </CardTitle>
                  <CardDescription>Ambiente de cultivo principal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span>24°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <span>65%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span>12h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Cronograma de Cultivo</CardTitle>
                <CardDescription>Visualização dos ciclos de cultivo atuais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Espécie</th>
                        <th scope="col" className="px-6 py-3">Data Início</th>
                        <th scope="col" className="px-6 py-3">Fase Atual</th>
                        <th scope="col" className="px-6 py-3">Previsão Colheita</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-001</th>
                        <td className="px-6 py-4">Cannabis Sativa</td>
                        <td className="px-6 py-4">15/03/2025</td>
                        <td className="px-6 py-4">Vegetativa</td>
                        <td className="px-6 py-4">25/06/2025</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Saudável</span>
                        </td>
                      </tr>
                      <tr className="bg-white border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-002</th>
                        <td className="px-6 py-4">Cannabis Indica</td>
                        <td className="px-6 py-4">02/03/2025</td>
                        <td className="px-6 py-4">Floração</td>
                        <td className="px-6 py-4">05/06/2025</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Saudável</span>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">CLT-003</th>
                        <td className="px-6 py-4">Cannabis Ruderalis</td>
                        <td className="px-6 py-4">20/02/2025</td>
                        <td className="px-6 py-4">Maturação</td>
                        <td className="px-6 py-4">10/05/2025</td>
                        <td className="px-6 py-4">
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Atenção</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="batches">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              Conteúdo da aba de Lotes estará disponível em breve.
            </div>
          </TabsContent>
          
          <TabsContent value="plants">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              Conteúdo da aba de Plantas estará disponível em breve.
            </div>
          </TabsContent>
          
          <TabsContent value="records">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              Conteúdo da aba de Registros estará disponível em breve.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};
// Temporariamente usando o bypass para testes
// Removendo a verificação de acesso ao módulo para diagnosticar o problema

export default bypassModuleAccess(CultivationModule, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita. Monitore condições ambientais, registre o crescimento, controle pragas e maximize a produtividade de suas plantações.",
  modulePrice: 99.00
});