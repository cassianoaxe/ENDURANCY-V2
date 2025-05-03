import React, { useState, useEffect } from 'react';
import { Card, Heading } from '@/components/ui';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import axios from 'axios';

interface ShipmentStatsDashboardProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface ShipmentStats {
  // Dados para gráfico de barras
  shipmentsByDay: {
    name: string;
    enviados: number;
    entregues: number;
  }[];
  
  // Dados para gráfico de pizza
  shipmentsByStatus: {
    name: string;
    value: number;
    color: string;
  }[];
  
  // Estatísticas gerais
  totalShipments: number;
  completedShipments: number;
  inProgressShipments: number;
  averageDeliveryTime: number;
}

const ShipmentStatsDashboard: React.FC<ShipmentStatsDashboardProps> = ({ period }) => {
  const [stats, setStats] = useState<ShipmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/expedicao/shipment-stats?period=${period}`);
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar estatísticas de expedição:', err);
        setError('Não foi possível carregar as estatísticas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [period]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-center">
          <p className="text-red-500">{error || 'Erro ao carregar dados'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  
  // Estatísticas resumidas
  const StatsCards = () => (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Card className="p-3 bg-green-50 border-green-200">
        <div className="text-sm text-muted-foreground">Total de Envios</div>
        <div className="text-2xl font-bold">{stats.totalShipments}</div>
      </Card>
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="text-sm text-muted-foreground">Entregues</div>
        <div className="text-2xl font-bold">{stats.completedShipments}</div>
      </Card>
      <Card className="p-3 bg-amber-50 border-amber-200">
        <div className="text-sm text-muted-foreground">Em Progresso</div>
        <div className="text-2xl font-bold">{stats.inProgressShipments}</div>
      </Card>
      <Card className="p-3 bg-purple-50 border-purple-200">
        <div className="text-sm text-muted-foreground">Tempo Médio</div>
        <div className="text-2xl font-bold">{stats.averageDeliveryTime} dias</div>
      </Card>
    </div>
  );
  
  // Gráfico de pizza para status
  const StatusPieChart = () => (
    <div className="h-[200px] mt-6">
      <Heading as="h3" size="lg" weight="semibold" className="mb-2">
        Status dos Envios
      </Heading>
      <ResponsivePie
        data={stats.shipmentsByStatus.map(item => ({
          id: item.name,
          label: item.name,
          value: item.value,
          color: item.color
        }))}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={{ datum: 'data.color' }}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        enableArcLinkLabels={false}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      />
    </div>
  );
  
  // Gráfico de barras por período
  const ShipmentBarChart = () => (
    <div className="h-[200px] mt-6">
      <Heading as="h3" size="lg" weight="semibold" className="mb-2">
        Envios por {period === 'daily' ? 'Hora' : period === 'weekly' ? 'Dia' : period === 'monthly' ? 'Dia' : 'Mês'}
      </Heading>
      <ResponsiveBar
        data={stats.shipmentsByDay}
        keys={['enviados', 'entregues']}
        indexBy="name"
        margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={['#3b82f6', '#4ade80']}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={null}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 50,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        role="application"
        ariaLabel="Gráfico de envios por período"
        barAriaLabel={function(e){return e.id+": "+e.formattedValue+" envios no período: "+e.indexValue}}
      />
    </div>
  );
  
  return (
    <div className="space-y-4">
      <Heading as="h2" size="xl" weight="semibold">
        Estatísticas de Envios
      </Heading>
      
      <StatsCards />
      <StatusPieChart />
      <ShipmentBarChart />
    </div>
  );
};

export default ShipmentStatsDashboard;