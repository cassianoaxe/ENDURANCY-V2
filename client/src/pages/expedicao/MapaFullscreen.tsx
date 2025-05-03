import React, { useEffect, useState } from 'react';
import { Heading } from '@/components/ui';
import { useLocation } from 'wouter';
import BrasilShipmentMap from '@/components/expedicao/BrasilShipmentMap';
import { X } from 'lucide-react';

const MapaFullscreen: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [location] = useLocation();
  
  // Configuração no carregamento da página
  useEffect(() => {
    // Extrai o parâmetro period da URL
    const params = new URLSearchParams(window.location.search);
    const periodParam = params.get('period') as 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
    
    if (periodParam && ['daily', 'weekly', 'monthly', 'yearly'].includes(periodParam)) {
      setPeriod(periodParam);
    }
    
    // Ativa o modo de tela cheia automaticamente
    const enterFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Erro ao entrar em tela cheia: ${err.message}`);
        });
      }
    };
    
    // Pequeno atraso para garantir que a página seja renderizada primeiro
    const timer = setTimeout(enterFullscreen, 500);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  // Manipulador para sair da tela cheia e fechar a aba
  const exitAndClose = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        window.close(); // Fecha a aba após sair do modo de tela cheia
      }).catch(err => {
        console.error(`Erro ao sair da tela cheia: ${err.message}`);
        window.close(); // Tenta fechar mesmo se houver erro
      });
    } else {
      window.close(); // Se não estiver em tela cheia, apenas fecha
    }
  };
  
  return (
    <div className="relative w-full h-screen bg-background">
      {/* Botão para fechar */}
      <button 
        onClick={exitAndClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 transition-all"
        aria-label="Fechar tela cheia"
      >
        <X className="h-5 w-5 text-gray-700" />
      </button>
      
      <div className="p-4">
        <header className="mb-4">
          <Heading as="h1" size="xl" weight="bold">
            Mapa de Expedição - {period === 'daily' ? 'Diário' : 
                               period === 'weekly' ? 'Semanal' : 
                               period === 'monthly' ? 'Mensal' : 'Anual'}
          </Heading>
        </header>
        
        <div className="h-[calc(100vh-120px)]">
          <BrasilShipmentMap period={period} />
        </div>
      </div>
    </div>
  );
};

export default MapaFullscreen;