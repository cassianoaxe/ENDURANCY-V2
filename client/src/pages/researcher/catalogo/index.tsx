import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Versão simplificada para evitar problemas
export default function CatalogoPesquisas() {
  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Pesquisas</h1>
          <p className="text-gray-500">Repositório de estudos científicos e projetos de pesquisa</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Estudo C4-2025: Epilepsia Refratária</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Avaliação da eficácia do tratamento em pacientes com epilepsia refratária
              </p>
              <div className="mt-4 text-sm text-gray-500">Em andamento | 85% concluído</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estudo DC-2024: Dor Crônica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Avaliação de tratamentos alternativos para pacientes com dor crônica
              </p>
              <div className="mt-4 text-sm text-gray-500">Em andamento | 62% concluído</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estudo PA-2024: Parkinson</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Investigação de novas abordagens para tratamento de Parkinson
              </p>
              <div className="mt-4 text-sm text-gray-500">Em análise | 43% concluído</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estudo AN-2025: Ansiedade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Avaliação de tratamentos para ansiedade severa e distúrbios de ansiedade
              </p>
              <div className="mt-4 text-sm text-gray-500">Em recrutamento | 25% concluído</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estudo FM-2024: Fibromialgia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Investigação de tratamentos para dor e fadiga em pacientes com fibromialgia
              </p>
              <div className="mt-4 text-sm text-gray-500">Em análise | 50% concluído</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estudo IC-2025: Insônia Crônica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Avaliação de terapias para tratamento de distúrbios do sono e insônia
              </p>
              <div className="mt-4 text-sm text-gray-500">Em recrutamento | 15% concluído</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}