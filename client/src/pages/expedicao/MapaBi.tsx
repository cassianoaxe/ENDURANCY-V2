import React, { useState } from 'react';
import { Card, Heading, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { ExternalLink } from 'lucide-react';
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
    <button
      onClick={openMapInNewTab}
      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      aria-label="Abrir em tela cheia"
    >
      <ExternalLink className="h-4 w-4" />
      <span>Abrir em tela cheia</span>
    </button>
  );
};

const MapaBi: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  return (
    <div className="relative">
      <div className="p-6">
        <header className="mb-6">
          <Heading as="h1" size="2xl" weight="bold">Mapa BI - Expedição</Heading>
          <p className="text-muted-foreground">
            Visualização geográfica e estatísticas de envios
          </p>
        </header>
        
        <Tabs defaultValue="monthly" className="space-y-4" onValueChange={value => setPeriod(value as any)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="daily">Diário</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">Anual</TabsTrigger>
            </TabsList>
            
            <OpenInNewTabButton period={period} />
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