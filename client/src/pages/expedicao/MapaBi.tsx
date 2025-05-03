import React, { useState, useEffect } from 'react';
import { Box, Card, Separator, Heading, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Maximize2, Minimize2 } from 'lucide-react';
import BrasilShipmentMap from '@/components/expedicao/BrasilShipmentMap';
import ShipmentStatsDashboard from '@/components/expedicao/ShipmentStatsDashboard';

interface FullscreenControlProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

// Componente para controle de tela cheia
const FullscreenControl: React.FC<FullscreenControlProps> = ({ 
  isFullscreen, 
  onToggleFullscreen 
}) => {
  return (
    <button
      onClick={onToggleFullscreen}
      className="fixed top-4 right-4 z-50 p-2 bg-white bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 transition-all"
      aria-label={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
    >
      {isFullscreen ? (
        <Minimize2 className="h-5 w-5 text-gray-700" />
      ) : (
        <Maximize2 className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
};

const MapaBi: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Função para alternar o modo de tela cheia
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao entrar em tela cheia: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  // Monitora alterações no estado de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Monitora eventos de teclado para esc (sair da tela cheia)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);
  
  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <FullscreenControl isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
      
      <div className="p-6">
        <header className="mb-6">
          <Heading as="h1" size="2xl" weight="bold">Mapa BI - Expedição</Heading>
          <p className="text-muted-foreground">
            Visualização geográfica e estatísticas de envios
          </p>
        </header>
        
        <Tabs defaultValue="daily" className="space-y-4" onValueChange={value => setPeriod(value as any)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="daily">Diário</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">Anual</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="daily" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-4">
                <BrasilShipmentMap period="daily" />
              </Card>
              <Card className="p-4">
                <ShipmentStatsDashboard period="daily" />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-4">
                <BrasilShipmentMap period="weekly" />
              </Card>
              <Card className="p-4">
                <ShipmentStatsDashboard period="weekly" />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-4">
                <BrasilShipmentMap period="monthly" />
              </Card>
              <Card className="p-4">
                <ShipmentStatsDashboard period="monthly" />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="yearly" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-4">
                <BrasilShipmentMap period="yearly" />
              </Card>
              <Card className="p-4">
                <ShipmentStatsDashboard period="yearly" />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MapaBi;