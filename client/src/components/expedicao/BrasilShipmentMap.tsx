import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, Card } from '@/components/ui';
import { ResponsiveChoropleth } from '@nivo/geo';
// Importação direta do arquivo GeoJSON para garantir a disponibilidade imediata
import brasilGeoData from './brasil-geo.json';
import { Loader2 } from 'lucide-react';

interface StateDataItem {
  id: string;
  name: string;
  value: number;
}

interface BrasilShipmentMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  className?: string;
}

const BrasilShipmentMap: React.FC<BrasilShipmentMapProps> = ({ period, className }) => {
  const [statesData, setStatesData] = useState<StateDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados de expedição por estado
  useEffect(() => {
    const fetchShipmentsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/expedicao/shipments-by-state?period=${period}`);
        
        // Forçando para garantir que estamos recebendo um array válido
        const dataArray = Array.isArray(response.data) ? response.data : [];
        
        setStatesData(dataArray);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados de expedição por estado:', err);
        setError('Não foi possível carregar os dados de expedição');
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentsData();
  }, [period]);

  // Calcular valor mínimo e máximo para a escala de cores
  let minValue = 0;
  let maxValue = 100;
  
  if (statesData && statesData.length > 0) {
    const values = statesData.map(d => d.value);
    minValue = Math.min(...values);
    maxValue = Math.max(...values);
    
    // Ajustar o valor máximo para melhorar a visualização
    if (minValue === maxValue) {
      maxValue = minValue + 100;
    }
  }

  // Componente de carregamento
  const LoadingState = () => (
    <div className="flex items-center justify-center h-[500px]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Carregando dados do mapa...</p>
      </div>
    </div>
  );

  // Componente de erro
  const ErrorState = () => (
    <div className="flex items-center justify-center h-[500px]">
      <div className="text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <p className="text-gray-500 mb-4">Não foi possível carregar o mapa de expedição.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      <Heading as="h2" size="xl" weight="semibold" className="mb-4">
        Distribuição de Envios por Estado
      </Heading>
      
      <Card className="p-0 overflow-hidden border-gray-200">
        <div className="h-[550px] relative">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : (
            <ResponsiveChoropleth
              data={statesData}
              features={brasilGeoData.features}
              margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
              colors="blues"
              domain={[minValue, maxValue]}
              unknownColor="#e0e0e0"
              label="properties.name"
              valueFormat=".0f"
              projectionScale={650}
              projectionTranslation={[0.5, 0.85]}
              projectionRotation={[0, 0, 0]}
              enableGraticule={false}
              borderWidth={0.5}
              borderColor="#152538"
              theme={{
                background: "transparent",
                text: {
                  fontSize: 11,
                  fill: "#333333",
                  outlineWidth: 0,
                  outlineColor: "transparent"
                }
              }}
              legends={[
                {
                  anchor: 'bottom-left',
                  direction: 'column',
                  justify: true,
                  translateX: 20,
                  translateY: -10,
                  itemsSpacing: 0,
                  itemWidth: 94,
                  itemHeight: 18,
                  itemDirection: 'left-to-right',
                  itemTextColor: '#444',
                  itemOpacity: 0.85,
                  symbolSize: 18,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              tooltip={({ feature }) => {
                // @ts-ignore - Ignorando erros de tipagem para obter o ID da feature
                const featureId = feature.id;
                const state = statesData.find(s => s.id === featureId);
                
                // @ts-ignore - Ignorando erros de tipagem para obter propriedades da feature
                const stateName = feature.properties?.name || 'Estado';
                
                return (
                  <div className="bg-white p-3 shadow-lg rounded-md border border-gray-100">
                    <strong className="text-gray-900 block mb-1">{state?.name || stateName}</strong>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">
                        {state ? `${state.value} envios` : 'Sem dados de envio'}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
        
        {/* Título do período abaixo do mapa */}
        <div className="py-2 px-4 bg-gray-50 border-t border-gray-200 flex justify-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Período:</span> {' '}
            {period === 'daily' ? 'Diário' : 
             period === 'weekly' ? 'Semanal' : 
             period === 'monthly' ? 'Mensal' : 'Anual'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default BrasilShipmentMap;