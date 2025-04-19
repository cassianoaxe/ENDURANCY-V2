import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Versão extremamente simplificada para evitar problemas
export default function DoencasCondicoes() {
  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Doenças e Condições Médicas</h1>
          <p className="text-gray-500">Base de conhecimento e pesquisa sobre condições médicas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Epilepsia Refratária</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Condição neurológica caracterizada por convulsões recorrentes que não respondem 
                adequadamente aos tratamentos convencionais.
              </p>
              <div className="mt-4 text-sm text-gray-500">8 estudos | 124 pacientes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dor Crônica Neuropática</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Dor persistente causada por lesão ou disfunção do sistema nervoso, frequentemente 
                resistente a analgésicos convencionais.
              </p>
              <div className="mt-4 text-sm text-gray-500">12 estudos | 203 pacientes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Esclerose Múltipla</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Doença autoimune que afeta o sistema nervoso central, causando inflamação e 
                degeneração da mielina.
              </p>
              <div className="mt-4 text-sm text-gray-500">15 estudos | 187 pacientes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Doença de Parkinson</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Distúrbio neurodegenerativo progressivo que afeta o movimento, causando 
                tremores, rigidez e dificuldades motoras.
              </p>
              <div className="mt-4 text-sm text-gray-500">10 estudos | 156 pacientes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ansiedade Severa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Transtorno de ansiedade caracterizado por preocupação excessiva, tensão muscular 
                e sintomas físicos que afetam significativamente a qualidade de vida.
              </p>
              <div className="mt-4 text-sm text-gray-500">6 estudos | 245 pacientes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Fibromialgia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Síndrome caracterizada por dor musculoesquelética generalizada, fadiga, 
                distúrbios do sono e problemas cognitivos.
              </p>
              <div className="mt-4 text-sm text-gray-500">9 estudos | 178 pacientes</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}