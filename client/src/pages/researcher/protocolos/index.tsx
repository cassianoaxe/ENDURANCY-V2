import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Versão simplificada para evitar problemas
export default function Protocolos() {
  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Protocolos de Pesquisa</h1>
          <p className="text-gray-500">Metodologias e procedimentos padronizados para estudos científicos</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Protocolo de Análise Clínica EP-001</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Metodologia padronizada para avaliação de pacientes com epilepsia refratária
              </p>
              <div className="mt-4 text-sm text-gray-500">Versão 2.3 | Atualizado em Mar/2025</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Protocolo de Dosagem DC-002</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Procedimento para administração e monitoramento de dosagens em dor crônica
              </p>
              <div className="mt-4 text-sm text-gray-500">Versão 1.5 | Atualizado em Fev/2025</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Protocolo de Coleta SC-003</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Procedimentos de coleta e processamento de amostras para análise laboratorial
              </p>
              <div className="mt-4 text-sm text-gray-500">Versão 3.1 | Atualizado em Abr/2025</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Protocolo de Acompanhamento PA-004</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Metodologia para monitoramento de longo prazo de pacientes em estudos
              </p>
              <div className="mt-4 text-sm text-gray-500">Versão 1.8 | Atualizado em Mar/2025</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Protocolo de Análise Laboratorial AL-005</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Procedimentos padronizados para análise de amostras em laboratório
              </p>
              <div className="mt-4 text-sm text-gray-500">Versão 2.0 | Atualizado em Jan/2025</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Protocolo de Extração EX-006</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Procedimentos para extração e preparação de compostos para análise
              </p>
              <div className="mt-4 text-sm text-gray-500">Versão 1.2 | Atualizado em Fev/2025</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}