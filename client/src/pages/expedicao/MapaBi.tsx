import React, { useState, useEffect } from 'react';
import { Card, Heading, Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@/components/ui';
import { ExternalLink, MapPin, BarChart2, Maximize2 } from 'lucide-react';
import BrasilShipmentMap from '@/components/expedicao/BrasilShipmentMap';
import ShipmentStatsDashboard from '@/components/expedicao/ShipmentStatsDashboard';

// Interface para o botão de abrir em nova aba
interface OpenInNewTabButtonProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Componente para abrir o mapa em uma nova aba
const OpenInNewTabButton: React.FC<OpenInNewTabButtonProps> = ({ period }) => {
  const openMapInNewTab = () => {
    const url = `/expedicao/mapa-fullscreen?period=${period}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button 
      onClick={openMapInNewTab}
      variant="outline"
      className="flex items-center gap-1 shadow-sm"
      aria-label="Abrir em tela cheia"
    >
      <Maximize2 className="h-4 w-4 mr-1" />
      Tela cheia
    </Button>
  );
};

const MapaBi: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [mapHeight, setMapHeight] = useState(750);
  
  // Ajustar altura do mapa com base na altura da janela
  useEffect(() => {
    const updateMapHeight = () => {
      const windowHeight = window.innerHeight;
      // Define o mapa para ocupar pelo menos 70% da altura da janela
      const calculatedHeight = Math.max(750, windowHeight * 0.7);
      setMapHeight(calculatedHeight);
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    return () => window.removeEventListener('resize', updateMapHeight);
  }, []);
  
  return (
    <div className="relative bg-gray-50 min-h-screen">
      <div className="p-4 md:p-6">
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-6 w-6 text-primary" />
              <Heading as="h1" size="2xl" weight="bold">Mapa BI - Expedição</Heading>
            </div>
            <OpenInNewTabButton period={period} />
          </div>
          <p className="text-muted-foreground">
            Visualização geográfica e estatísticas de envios em tempo real
          </p>
        </header>
        
        <Tabs 
          defaultValue="monthly" 
          className="space-y-4" 
          onValueChange={value => setPeriod(value as any)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Período:</span>
            </div>
            
            <div className="flex flex-1 justify-center">
              <TabsList className="w-full max-w-md">
                <TabsTrigger value="daily">Diário</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="yearly">Anual</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="daily">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-12 flex justify-center w-full">
                <BrasilShipmentMap period="daily" height={mapHeight} />
              </div>
              <div className="xl:col-span-12">
                <ShipmentStatsDashboard period="daily" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="weekly">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-12 flex justify-center w-full">
                <BrasilShipmentMap period="weekly" height={mapHeight} />
              </div>
              <div className="xl:col-span-12">
                <ShipmentStatsDashboard period="weekly" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-12 flex justify-center w-full">
                <BrasilShipmentMap period="monthly" height={mapHeight} />
              </div>
              <div className="xl:col-span-12">
                <ShipmentStatsDashboard period="monthly" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="yearly">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-12 flex justify-center w-full">
                <BrasilShipmentMap period="yearly" height={mapHeight} />
              </div>
              <div className="xl:col-span-12">
                <ShipmentStatsDashboard period="yearly" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MapaBi;