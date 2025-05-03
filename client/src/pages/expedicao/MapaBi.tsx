import React, { useState } from 'react';
import { Card, Heading, Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@/components/ui';
import { ExternalLink, MapPin, BarChart2, ArrowLeft } from 'lucide-react';
import ShipmentStatsDashboard from '@/components/expedicao/ShipmentStatsDashboard';
import SimpleBrasilMap from '@/components/expedicao/SimpleBrasilMap';

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
      <ExternalLink className="h-4 w-4 mr-1" />
      Abrir em tela cheia
    </Button>
  );
};

// Componente simplificado do Mapa BI sem dependências de layout
const MapaBi: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Função para voltar para a página anterior
  const navigateBack = () => {
    window.history.back();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={navigateBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-6 w-6 text-primary" />
            <Heading as="h1" size="2xl" weight="bold">Mapa BI - Expedição</Heading>
          </div>
          <p className="text-muted-foreground">
            Visualização geográfica e estatísticas de envios em tempo real
          </p>
        </header>
        
        <Tabs 
          defaultValue="monthly" 
          className="space-y-6" 
          onValueChange={value => setPeriod(value as any)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Período:</span>
            </div>
            
            <div className="flex flex-1 justify-between sm:justify-center">
              <TabsList className="w-full max-w-md">
                <TabsTrigger value="daily">Diário</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="yearly">Anual</TabsTrigger>
              </TabsList>
            </div>
            
            <OpenInNewTabButton period={period} />
          </div>
          
          {['daily', 'weekly', 'monthly', 'yearly'].map((value) => (
            <TabsContent value={value} key={value}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SimpleBrasilMap period={period as any} />
                </div>
                <div>
                  <ShipmentStatsDashboard period={period as any} />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default MapaBi;