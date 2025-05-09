import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Package, Mail, MapPin, Truck } from 'lucide-react';

// Tipos para estatísticas de envio
interface ShipmentStats {
  total: number;
  byRegion: {
    norte: number;
    nordeste: number;
    centro_oeste: number;
    sudeste: number;
    sul: number;
  };
  topStates: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  growth: number;
  deliveryRate: number;
  avgDeliveryTime: number;
}

interface ShipmentStatsDashboardProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const ShipmentStatsDashboard: React.FC<ShipmentStatsDashboardProps> = ({ period }) => {
  // Buscar dados de estatísticas da API
  const { data, isLoading } = useQuery({
    queryKey: [`/api/expedicao/stats/${period}`],
    queryFn: async () => {
      // Simular dados de estatísticas
      const mockStats: ShipmentStats = {
        total: period === 'daily' ? 342 : 
              period === 'weekly' ? 1835 :
              period === 'monthly' ? 6320 : 74500,
        byRegion: {
          norte: period === 'daily' ? 25 : period === 'weekly' ? 140 : period === 'monthly' ? 580 : 6800,
          nordeste: period === 'daily' ? 78 : period === 'weekly' ? 420 : period === 'monthly' ? 1450 : 17200,
          centro_oeste: period === 'daily' ? 54 : period === 'weekly' ? 290 : period === 'monthly' ? 1110 : 13000,
          sudeste: period === 'daily' ? 128 : period === 'weekly' ? 680 : period === 'monthly' ? 2320 : 26500,
          sul: period === 'daily' ? 57 : period === 'weekly' ? 305 : period === 'monthly' ? 860 : 11000
        },
        topStates: [
          { id: "SP", name: "São Paulo", count: period === 'daily' ? 89 : period === 'weekly' ? 480 : period === 'monthly' ? 1650 : 19200 },
          { id: "RJ", name: "Rio de Janeiro", count: period === 'daily' ? 42 : period === 'weekly' ? 230 : period === 'monthly' ? 800 : 9300 },
          { id: "MG", name: "Minas Gerais", count: period === 'daily' ? 32 : period === 'weekly' ? 175 : period === 'monthly' ? 650 : 7500 },
          { id: "RS", name: "Rio Grande do Sul", count: period === 'daily' ? 30 : period === 'weekly' ? 165 : period === 'monthly' ? 580 : 6900 },
          { id: "PR", name: "Paraná", count: period === 'daily' ? 27 : period === 'weekly' ? 142 : period === 'monthly' ? 490 : 5800 }
        ],
        growth: period === 'daily' ? 5.7 : period === 'weekly' ? 3.8 : period === 'monthly' ? 12.4 : 8.2,
        deliveryRate: 98.3,
        avgDeliveryTime: 3.2
      };
      
      return mockStats;
    },
    refetchOnWindowFocus: false
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 border">
        <p className="text-sm text-gray-600">Não foi possível carregar as estatísticas.</p>
      </div>
    );
  }
  
  // Formatar período para exibição
  const periodText = period === 'daily' ? 'hoje' : 
                     period === 'weekly' ? 'esta semana' : 
                     period === 'monthly' ? 'este mês' : 'este ano';
  
  // Formatar crescimento com sinal
  const growthFormatted = data.growth > 0 ? `+${data.growth.toFixed(1)}%` : `${data.growth.toFixed(1)}%`;
  const isPositiveGrowth = data.growth > 0;
  
  return (
    <div className="space-y-4">
      {/* Card principal com total e crescimento */}
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Total de Envios {periodText}</span>
          <div className="flex items-end mt-1 gap-2">
            <span className="text-2xl font-bold">{data.total.toLocaleString('pt-BR')}</span>
            <div className={`flex items-center text-xs ${
              isPositiveGrowth ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {isPositiveGrowth ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {growthFormatted}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Distribuição por região */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Distribuição por Região</h3>
        <div className="space-y-2">
          {Object.entries(data.byRegion).map(([region, count]) => {
            const percentage = (count / data.total) * 100;
            const regionNames: {[key: string]: string} = {
              norte: 'Norte',
              nordeste: 'Nordeste',
              centro_oeste: 'Centro-Oeste',
              sudeste: 'Sudeste',
              sul: 'Sul'
            };
            
            return (
              <div key={region}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{regionNames[region]}</span>
                  <span>{count.toLocaleString('pt-BR')} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Top 5 estados */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Top 5 Estados</h3>
        <div className="space-y-2">
          {data.topStates.map((state, index) => (
            <div key={state.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mr-2">
                  {index + 1}
                </span>
                <span className="text-sm">{state.name}</span>
              </div>
              <span className="text-sm font-medium">{state.count.toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Métricas adicionais */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-primary mr-2" />
            <div>
              <div className="text-xs text-muted-foreground">Taxa de Entrega</div>
              <div className="text-lg font-medium">{data.deliveryRate}%</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center">
            <Truck className="h-5 w-5 text-primary mr-2" />
            <div>
              <div className="text-xs text-muted-foreground">Tempo Médio</div>
              <div className="text-lg font-medium">{data.avgDeliveryTime} dias</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Dicas */}
      <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg">
        <p className="font-medium mb-1">Dicas:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Clique no ícone <span className="font-mono bg-gray-100 px-1 rounded">S</span> para mostrar/esconder este painel</li>
          <li>Use as teclas <span className="font-mono bg-gray-100 px-1 rounded">1-4</span> para mudar o período</li>
        </ul>
      </div>
    </div>
  );
};

export default ShipmentStatsDashboard;