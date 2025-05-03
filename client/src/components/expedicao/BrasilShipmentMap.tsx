import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading } from '@/components/ui';
import { ResponsiveChoropleth } from '@nivo/geo';
// Importação direta do arquivo GeoJSON para garantir a disponibilidade imediata
import brasilGeoData from './brasil-geo.json';

interface StateDataItem {
  id: string;
  name: string;
  value: number;
}

interface BrasilShipmentMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const BrasilShipmentMap: React.FC<BrasilShipmentMapProps> = ({ period }) => {
  const [statesData, setStatesData] = useState<StateDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados de expedição por estado
  useEffect(() => {
    const fetchShipmentsData = async () => {
      setLoading(true);
      try {
        console.log('Iniciando requisição para dados de expedição, período:', period);
        const response = await axios.get(`/api/expedicao/shipments-by-state?period=${period}`);
        
        // Forçando para garantir que estamos recebendo um array válido
        const dataArray = Array.isArray(response.data) ? response.data : [];
        console.log('Dados de estados recebidos:', dataArray);
        
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
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

  return (
    <div className="h-[600px] w-full">
      <Heading as="h2" size="xl" weight="semibold" className="mb-4">
        Distribuição de Envios por Estado
      </Heading>
      
      <div className="h-[550px] border border-gray-200 rounded-lg overflow-hidden bg-white">
        <ResponsiveChoropleth
          data={statesData}
          features={brasilGeoData.features}
          margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
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
            
            if (!state) {
              // Mostrar o estado mesmo sem dados
              return (
                <div className="bg-white p-2 shadow-md rounded-md">
                  {/* @ts-ignore - Ignorando erros de tipagem para obter propriedades da feature */}
                  <strong>{feature.properties ? feature.properties.name : 'Estado'}</strong>
                  <div>Sem dados de envio</div>
                </div>
              );
            }
            
            return (
              <div className="bg-white p-2 shadow-md rounded-md">
                <strong>{state.name}</strong>
                <div>Envios: {state.value}</div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default BrasilShipmentMap;