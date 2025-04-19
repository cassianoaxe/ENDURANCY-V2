import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Versão simplificada para evitar problemas
export default function LaboratorioPesquisa() {
  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Laboratório de Pesquisa</h1>
          <p className="text-gray-500">Gerenciamento de amostras e resultados de análises laboratoriais</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Amostras Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Amostras aguardando processamento e análise
              </p>
              <div className="mt-4 text-sm text-gray-500">12 amostras | Prioridade alta</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Análises em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Análises em processamento no laboratório
              </p>
              <div className="mt-4 text-sm text-gray-500">8 análises | 3 técnicos envolvidos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resultados Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Resultados finalizados das últimas análises
              </p>
              <div className="mt-4 text-sm text-gray-500">15 resultados | Última semana</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Equipamentos e recursos do laboratório
              </p>
              <div className="mt-4 text-sm text-gray-500">7 equipamentos | 2 em manutenção</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Agenda do Laboratório</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Agendamentos e reservas de equipamentos
              </p>
              <div className="mt-4 text-sm text-gray-500">5 reservas | Próximos 7 dias</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estoque de Reagentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Controle de reagentes e materiais de laboratório
              </p>
              <div className="mt-4 text-sm text-gray-500">3 itens em baixa | Atualizado hoje</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}