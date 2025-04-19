import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Versão simplificada para evitar problemas
export default function BancoPacientes() {
  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Banco de Pacientes</h1>
          <p className="text-gray-500">Gerenciamento de participantes de pesquisas clínicas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Participantes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">248</div>
              <p className="text-sm text-gray-500">+12 este mês</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estudos em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-sm text-gray-500">Em diferentes fases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Condições Catalogadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <p className="text-sm text-gray-500">Principais condições estudadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Acompanhamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">15</div>
              <p className="text-sm text-gray-500">Para os próximos 7 dias</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Grupos de Pacientes por Condição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Epilepsia Refratária</h3>
                  <p className="text-sm text-gray-500">Estudo C4-2025</p>
                </div>
                <div className="text-sm">68 pacientes</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Dor Crônica Neuropática</h3>
                  <p className="text-sm text-gray-500">Estudo DC-2024</p>
                </div>
                <div className="text-sm">42 pacientes</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Doença de Parkinson</h3>
                  <p className="text-sm text-gray-500">Estudo PA-2024</p>
                </div>
                <div className="text-sm">35 pacientes</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Ansiedade Severa</h3>
                  <p className="text-sm text-gray-500">Estudo AN-2025</p>
                </div>
                <div className="text-sm">54 pacientes</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Fibromialgia</h3>
                  <p className="text-sm text-gray-500">Estudo FM-2024</p>
                </div>
                <div className="text-sm">28 pacientes</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Insônia Crônica</h3>
                  <p className="text-sm text-gray-500">Estudo IC-2025</p>
                </div>
                <div className="text-sm">21 pacientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}