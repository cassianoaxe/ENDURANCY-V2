import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Versão simplificada para evitar problemas
export default function Colaboracoes() {
  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Colaborações de Pesquisa</h1>
          <p className="text-gray-500">Parceiros e instituições colaboradoras em projetos de pesquisa</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Universidade de São Paulo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Colaboração em pesquisas neurológicas e estudos clínicos sobre epilepsia
              </p>
              <div className="mt-4 text-sm text-gray-500">3 projetos ativos | Desde 2023</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hospital Albert Einstein</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Parceria para estudos clínicos e desenvolvimento de protocolos de tratamento
              </p>
              <div className="mt-4 text-sm text-gray-500">2 projetos ativos | Desde 2024</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Instituto Nacional de Neurociência</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Colaboração em pesquisa básica e aplicada sobre doenças neurodegenerativas
              </p>
              <div className="mt-4 text-sm text-gray-500">1 projeto ativo | Desde 2023</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Centro de Pesquisas Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Parceria para desenvolvimento de novos tratamentos e terapias inovadoras
              </p>
              <div className="mt-4 text-sm text-gray-500">4 projetos ativos | Desde 2022</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>UNIFESP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Colaboração em estudos sobre dor crônica e condições neurológicas
              </p>
              <div className="mt-4 text-sm text-gray-500">2 projetos ativos | Desde 2023</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Laboratório de Pesquisa Aurora</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Parceria para análises laboratoriais e desenvolvimento de protocolos
              </p>
              <div className="mt-4 text-sm text-gray-500">3 projetos ativos | Desde 2024</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}