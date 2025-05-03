import React, { useState, useEffect } from 'react';
import { Card, Heading } from '@/components/ui';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import axios from 'axios';

interface ShipmentStatsDashboardProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  fullscreen?: boolean;
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

const ShipmentStatsDashboard: React.FC<ShipmentStatsDashboardProps> = ({ period, fullscreen = false }) => {
  const [stats, setStats] = useState<ShipmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    // Simular tempo de carregamento
    setTimeout(() => {
      try {
        // Dados mock para visualização das estatísticas
        const mockData: ShipmentStats = {
          // Estatísticas gerais
          totalShipments: 8742,
          completedShipments: 7126,
          inProgressShipments: 1616,
          averageDeliveryTime: 3.2,
          
          // Dados para gráfico de status
          shipmentsByStatus: [
            { name: "Entregue", value: 7126, color: "#4ade80" },
            { name: "Em Trânsito", value: 892, color: "#3b82f6" },
            { name: "Pendente", value: 452, color: "#f59e0b" },
            { name: "Atrasado", value: 272, color: "#ef4444" }
          ],
          
          // Dados para gráfico de barras
          shipmentsByDay: period === 'daily' ? [
            { name: "08:00", enviados: 42, entregues: 18 },
            { name: "10:00", enviados: 63, entregues: 26 },
            { name: "12:00", enviados: 55, entregues: 38 },
            { name: "14:00", enviados: 78, entregues: 51 },
            { name: "16:00", enviados: 61, entregues: 44 },
            { name: "18:00", enviados: 35, entregues: 27 }
          ] : period === 'weekly' ? [
            { name: "Seg", enviados: 245, entregues: 210 },
            { name: "Ter", enviados: 358, entregues: 302 },
            { name: "Qua", enviados: 287, entregues: 251 },
            { name: "Qui", enviados: 315, entregues: 260 },
            { name: "Sex", enviados: 401, entregues: 353 },
            { name: "Sáb", enviados: 142, entregues: 124 }
          ] : period === 'monthly' ? [
            { name: "01-07", enviados: 1042, entregues: 845 },
            { name: "08-14", enviados: 1358, entregues: 1276 },
            { name: "15-21", enviados: 987, entregues: 861 },
            { name: "22-28", enviados: 1215, entregues: 1103 }
          ] : [
            { name: "Jan", enviados: 4582, entregues: 4125 },
            { name: "Fev", enviados: 3916, entregues: 3620 },
            { name: "Mar", enviados: 5214, entregues: 4863 },
            { name: "Abr", enviados: 4753, entregues: 4321 },
            { name: "Mai", enviados: 5612, entregues: 5103 },
            { name: "Jun", enviados: 4875, entregues: 4576 }
          ]
        };
        
        setStats(mockData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar estatísticas de expedição:', err);
        setError('Não foi possível carregar as estatísticas');
      } finally {
        setLoading(false);
      }
    }, 800);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="text-sm text-muted-foreground">Total de Envios</div>
          <div className="text-2xl font-bold">{totalShipments}</div>
        </Card>
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="text-sm text-muted-foreground">Entregues</div>
          <div className="text-2xl font-bold">{completedShipments}</div>
        </Card>
        <Card className="p-3 bg-amber-50 border-amber-200">
          <div className="text-sm text-muted-foreground">Em Progresso</div>
          <div className="text-2xl font-bold">{inProgressShipments}</div>
        </Card>
        <Card className="p-3 bg-purple-50 border-purple-200">
          <div className="text-sm text-muted-foreground">Tempo Médio</div>
          <div className="text-2xl font-bold">{averageDeliveryTime}{typeof averageDeliveryTime === 'number' ? ' dias' : ''}</div>
        </Card>
      </div>
    );
  };
  
  // Gráfico de pizza para status
  const StatusPieChart = () => {
    // Verificar se os dados de status estão disponíveis
    if (!stats.shipmentsByStatus || !Array.isArray(stats.shipmentsByStatus) || stats.shipmentsByStatus.length === 0) {
      return (
        <div className="h-[200px] mt-6">
          <Heading as="h3" size="lg" weight="semibold" className="mb-2">
            Status dos Envios
          </Heading>
          <div className="flex items-center justify-center h-[200px] bg-slate-50 rounded-md">
            <p className="text-slate-500">Dados de status não disponíveis</p>
          </div>
        </div>
      );
    }
    
    // Se os dados existirem, renderizar o gráfico
    return (
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
  };
  
  // Gráfico de barras por período
  const ShipmentBarChart = () => {
    // Verificar se os dados de shipmentsByDay estão disponíveis
    if (!stats.shipmentsByDay || !Array.isArray(stats.shipmentsByDay) || stats.shipmentsByDay.length === 0) {
      return (
        <div className="h-[200px] mt-6">
          <Heading as="h3" size="lg" weight="semibold" className="mb-2">
            Envios por {period === 'daily' ? 'Hora' : period === 'weekly' ? 'Dia' : period === 'monthly' ? 'Dia' : 'Mês'}
          </Heading>
          <div className="flex items-center justify-center h-[200px] bg-slate-50 rounded-md">
            <p className="text-slate-500">Dados de envios não disponíveis</p>
          </div>
        </div>
      );
    }
    
    // Se os dados existirem, renderizar o gráfico
    return (
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
  };
  
  return (
    <div className="space-y-4">
      <Heading as="h2" size="xl" weight="semibold" className="mb-6">
        Estatísticas de Envios
      </Heading>
      
      <StatsCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusPieChart />
        <ShipmentBarChart />
      </div>
    </div>
  );
};

export default ShipmentStatsDashboard;