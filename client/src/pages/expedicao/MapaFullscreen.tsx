import React, { useState, useEffect } from 'react';
import BrasilTVMap from '../../components/expedicao/BrasilTVMapNew';
import ShipmentStatsDashboard from '../../components/expedicao/ShipmentStatsDashboard';
import { Loader2, ArrowLeft, LayoutPanelLeft } from 'lucide-react';

const MapaFullscreen: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Simular tempo de carregamento para transições suaves
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Alternar período com teclas de atalho (1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setPeriod('daily');
      else if (e.key === '2') setPeriod('weekly');
      else if (e.key === '3') setPeriod('monthly');
      else if (e.key === '4') setPeriod('yearly');
      else if (e.key === 'Escape') window.history.back();
      else if (e.key === 's') setShowSidebar(!showSidebar);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSidebar]);
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-xl">Carregando mapa interativo...</p>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-screen bg-background overflow-hidden">
      <div className="fixed top-4 left-4 z-20 flex gap-2">
        <button 
          onClick={() => window.history.back()}
          className="h-10 w-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className={`h-10 w-10 rounded-full ${showSidebar ? 'bg-primary text-white' : 'bg-white/80 hover:bg-white text-gray-700'} flex items-center justify-center shadow-md`}
          title={showSidebar ? "Esconder estatísticas" : "Mostrar estatísticas"}
        >
          <LayoutPanelLeft className="h-5 w-5" />
        </button>
      </div>
      
      <div className="fixed top-4 right-4 z-20 flex gap-2 bg-white/80 shadow-md rounded-full p-1">
        <button 
          onClick={() => setPeriod('daily')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            period === 'daily' 
              ? 'bg-primary text-white' 
              : 'bg-transparent hover:bg-gray-200 text-gray-800'
          }`}
        >
          Diário
        </button>
        <button 
          onClick={() => setPeriod('weekly')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            period === 'weekly' 
              ? 'bg-primary text-white' 
              : 'bg-transparent hover:bg-gray-200 text-gray-800'
          }`}
        >
          Semanal
        </button>
        <button 
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            period === 'monthly' 
              ? 'bg-primary text-white' 
              : 'bg-transparent hover:bg-gray-200 text-gray-800'
          }`}
        >
          Mensal
        </button>
        <button 
          onClick={() => setPeriod('yearly')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            period === 'yearly' 
              ? 'bg-primary text-white' 
              : 'bg-transparent hover:bg-gray-200 text-gray-800'
          }`}
        >
          Anual
        </button>
      </div>
      
      <div className="flex h-screen">
        <div className={`transition-all duration-300 ${showSidebar ? 'w-3/4' : 'w-full'}`}>
          <BrasilTVMap 
            period={period} 
            fullscreen={true} 
            colorMode="colored"
            showStateLabels={true}
            sidebarOpen={showSidebar}
          />
        </div>
        
        {showSidebar && (
          <div className="w-1/4 bg-white p-4 shadow-lg overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Estatísticas de Expedição</h2>
            
            <div className="space-y-4">
              {/* Painel de estatísticas de envio */}
              <ShipmentStatsDashboard period={period} />
              
              <div className="p-4 rounded-lg bg-gray-50 border">
                <h3 className="font-medium mb-2">Atalhos do Teclado</h3>
                <ul className="text-sm space-y-2">
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded">1</kbd> - Período Diário</li>
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded">2</kbd> - Período Semanal</li>
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded">3</kbd> - Período Mensal</li>
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded">4</kbd> - Período Anual</li>
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded">S</kbd> - Mostrar/Esconder Painel Lateral</li>
                  <li><kbd className="px-2 py-1 bg-gray-200 rounded">ESC</kbd> - Voltar</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="fixed bottom-4 left-4 z-10 p-3 text-sm text-gray-600 bg-white/90 rounded-lg shadow">
        <strong>Atalhos:</strong> Pressione 1-4 para alternar períodos, S para o painel lateral, ESC para voltar
      </div>
    </div>
  );
};

export default MapaFullscreen;