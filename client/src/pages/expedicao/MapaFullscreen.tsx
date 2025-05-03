import React, { useEffect, useState } from 'react';
import { Heading } from '@/components/ui';
import { useLocation } from 'wouter';
import ShipmentStatsDashboard from '@/components/expedicao/ShipmentStatsDashboard';
import SimpleBrasilMap from '@/components/expedicao/SimpleBrasilMap';
import { X, Maximize2 } from 'lucide-react';

const MapaFullscreen: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [location] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Configuração no carregamento da página
  useEffect(() => {
    // Extrai o parâmetro period da URL
    const params = new URLSearchParams(window.location.search);
    const periodParam = params.get('period') as 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
    
    if (periodParam && ['daily', 'weekly', 'monthly', 'yearly'].includes(periodParam)) {
      setPeriod(periodParam);
    }
    
    // Pequeno atraso para garantir que a página seja renderizada primeiro
    const timer = setTimeout(() => {
      requestFullscreen();
    }, 500);
    
    // Verificar se já está em modo de tela cheia
    const checkFullscreenStatus = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    // Adicionar event listener para mudanças no estado de tela cheia
    document.addEventListener('fullscreenchange', checkFullscreenStatus);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('fullscreenchange', checkFullscreenStatus);
    };
  }, [location]);
  
  // Função para entrar em tela cheia
  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao entrar em tela cheia: ${err.message}`);
      });
    }
  };
  
  // Função para sair da tela cheia
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.error(`Erro ao sair da tela cheia: ${err.message}`);
      });
    }
  };
  
  // Manipulador para alternar tela cheia
  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };
  
  // Manipulador para fechar a aba
  const closeTab = () => {
    window.close();
  };
  
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Botões de controle */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={toggleFullscreen}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
          title={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
        >
          <Maximize2 className="h-5 w-5 text-gray-700" />
        </button>
        
        <button 
          onClick={closeTab}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Fechar"
          title="Fechar"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      
      <div className="p-6">
        <header className="mb-6 flex justify-between items-center">
          <Heading as="h1" size="xl" weight="bold" className="text-gray-800">
            Mapa de Expedição 
            <span className="ml-2 text-primary">
              {period === 'daily' ? 'Diário' : 
               period === 'weekly' ? 'Semanal' : 
               period === 'monthly' ? 'Mensal' : 'Anual'}
            </span>
          </Heading>
        </header>
        
        <div className="flex flex-col gap-8">
          {/* Mapa centralizado com maior visibilidade */}
          <div className="w-full flex justify-center">
            <SimpleBrasilMap
              period={period}
              className="w-full"
              fullscreen={true}
            />
          </div>
          
          {/* Estatísticas abaixo com melhor organização */}
          <div className="w-full">
            <ShipmentStatsDashboard period={period} fullscreen={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaFullscreen;