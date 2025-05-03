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
  const StatsCards = () => {
    // Verificar se os campos necessários estão disponíveis
    const totalShipments = stats.totalShipments !== undefined ? stats.totalShipments : '-';
    const completedShipments = stats.completedShipments !== undefined ? stats.completedShipments : '-';
    const inProgressShipments = stats.inProgressShipments !== undefined ? stats.inProgressShipments : '-';
    const averageDeliveryTime = stats.averageDeliveryTime !== undefined ? stats.averageDeliveryTime : '-';
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-green-50 border-green-200 flex flex-col items-center justify-center">
          <div className="text-sm text-muted-foreground mb-1">Total de Envios</div>
          <div className="text-3xl font-bold">{totalShipments}</div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200 flex flex-col items-center justify-center">
          <div className="text-sm text-muted-foreground mb-1">Entregues</div>
          <div className="text-3xl font-bold">{completedShipments}</div>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-200 flex flex-col items-center justify-center">
          <div className="text-sm text-muted-foreground mb-1">Em Progresso</div>
          <div className="text-3xl font-bold">{inProgressShipments}</div>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200 flex flex-col items-center justify-center">
          <div className="text-sm text-muted-foreground mb-1">Tempo Médio</div>
          <div className="text-3xl font-bold">{averageDeliveryTime}{typeof averageDeliveryTime === 'number' ? ' dias' : ''}</div>
        </Card>
      </div>
    );
  };
  
  // Gráfico de pizza para status
  const StatusPieChart = () => {
    // Verificar se os dados de status estão disponíveis
    if (!stats.shipmentsByStatus || !Array.isArray(stats.shipmentsByStatus) || stats.shipmentsByStatus.length === 0) {
      return (
        <div>
          <Heading as="h3" size="lg" weight="semibold" className="mb-3">
            Status dos Envios
          </Heading>
          <div className="flex items-center justify-center h-[250px] bg-slate-50 rounded-md">
            <p className="text-slate-500">Dados de status não disponíveis</p>
          </div>
        </div>
      );
    }
    
    // Se os dados existirem, renderizar o gráfico
    return (
      <div>
        <Heading as="h3" size="lg" weight="semibold" className="mb-3">
          Status dos Envios
        </Heading>
        <div className="h-[250px]">
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
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 20,
                itemsSpacing: 10,
                itemWidth: 85,
                itemHeight: 18,
                itemTextColor: '#777',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: 'circle'
              }
            ]}
          />
        </div>
      </div>
    );
  };
  
  // Gráfico de barras por período
  const ShipmentBarChart = () => {
    // Verificar se os dados de shipmentsByDay estão disponíveis
    if (!stats.shipmentsByDay || !Array.isArray(stats.shipmentsByDay) || stats.shipmentsByDay.length === 0) {
      return (
        <div>
          <Heading as="h3" size="lg" weight="semibold" className="mb-3">
            Envios por {period === 'daily' ? 'Hora' : period === 'weekly' ? 'Dia' : period === 'monthly' ? 'Dia' : 'Mês'}
          </Heading>
          <div className="flex items-center justify-center h-[250px] bg-slate-50 rounded-md">
            <p className="text-slate-500">Dados de envios não disponíveis</p>
          </div>
        </div>
      );
    }
    
    // Se os dados existirem, renderizar o gráfico
    return (
      <div>
        <Heading as="h3" size="lg" weight="semibold" className="mb-3">
          Envios por {period === 'daily' ? 'Hora' : period === 'weekly' ? 'Dia' : period === 'monthly' ? 'Dia' : 'Mês'}
        </Heading>
        <div className="h-[250px]">
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
                translateY: 20,
                itemsSpacing: 10,
                itemWidth: 85,
                itemHeight: 18,
                itemTextColor: '#777',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: 'square'
              }
            ]}
            role="application"
            ariaLabel="Gráfico de envios por período"
            barAriaLabel={function(e){return e.id+": "+e.formattedValue+" envios no período: "+e.indexValue}}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6 w-full bg-white rounded-lg p-6 shadow-sm">
      <Heading as="h2" size="xl" weight="semibold" className="text-center mb-6">
        Estatísticas de Envios
      </Heading>
      
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 border-2 border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <StatusPieChart />
        </Card>
        <Card className="p-4 border-2 border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <ShipmentBarChart />
        </Card>
      </div>
    </div>
  );
};

export default ShipmentStatsDashboard;