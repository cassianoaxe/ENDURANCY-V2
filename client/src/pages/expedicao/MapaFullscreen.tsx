import React, { useState, useEffect } from 'react';
import BrasilMapSimple from '../../components/expedicao/BrasilMapSimple';
import { Loader2 } from 'lucide-react';

const MapaFullscreen: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  
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
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Carregando mapa interativo...</p>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-screen bg-background p-4">
      <div className="w-full h-[90vh]">
        <div className="fixed top-2 right-2 z-10 flex gap-2">
          <button 
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              period === 'daily' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Diário
          </button>
          <button 
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              period === 'weekly' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Semanal
          </button>
          <button 
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              period === 'monthly' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Mensal
          </button>
          <button 
            onClick={() => setPeriod('yearly')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              period === 'yearly' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Anual
          </button>
        </div>
        
        <div className="h-full">
          <BrasilMapSimple period={period} fullscreen={true} />
        </div>
        
        <div className="fixed bottom-2 left-2 p-2 text-xs text-muted-foreground bg-white/80 rounded shadow">
          <strong>Atalhos:</strong> Pressione 1-4 para alternar períodos
        </div>
      </div>
    </div>
  );
};

export default MapaFullscreen;