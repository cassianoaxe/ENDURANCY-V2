import { useState } from 'react';
import { useLocation } from 'wouter';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';

export default function TestPage() {
  const [location, setLocation] = useLocation();
  const [counter, setCounter] = useState(0);

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Página de Teste</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-lg mb-4">Localização atual: <span className="font-bold">{location}</span></p>
            <p className="text-lg mb-4">Contador: <span className="font-bold">{counter}</span></p>
            
            <div className="flex gap-4 flex-wrap">
              <button 
                onClick={() => setCounter(counter + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Incrementar contador
              </button>
              
              <button 
                onClick={() => setLocation('/researcher/dashboard')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Ir para Dashboard
              </button>
              
              <button 
                onClick={() => setLocation('/researcher/catalogo')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Ir para Catálogo
              </button>
              
              <button 
                onClick={() => window.location.href = '/researcher/estudos'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Ir para Estudos (window.location)
              </button>
            </div>
          </div>
        </div>
      </div>
    </ResearcherLayout>
  );
}