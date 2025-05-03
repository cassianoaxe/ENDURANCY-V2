import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading } from '@/components/ui';
import { ResponsiveChoropleth } from '@nivo/geo';

interface StateDataItem {
  id: string;
  name: string;
  value: number;
}

interface BrasilShipmentMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Precisamos importar os dados geográficos do Brasil
// Este arquivo é geralmente grande, então você precisará criar um arquivo brasil-geo.json separado
const BrasilShipmentMap: React.FC<BrasilShipmentMapProps> = ({ period }) => {
  const [statesData, setStatesData] = useState<StateDataItem[]>([]);
  const [geographyData, setGeographyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar os dados geográficos do Brasil
  useEffect(() => {
    const fetchGeographyData = async () => {
      try {
        // Importar dinamicamente o arquivo de dados geográficos
        const response = await import('./brasil-geo.json');
        setGeographyData(response.default);
      } catch (err) {
        console.error('Erro ao carregar dados geográficos:', err);
        setError('Não foi possível carregar o mapa do Brasil');
      }
    };

    fetchGeographyData();
  }, []);

  // Carregar dados de expedição por estado
  useEffect(() => {
    const fetchShipmentsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/expedicao/shipments-by-state?period=${period}`);
        setStatesData(response.data);
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
  const minValue = statesData && Array.isArray(statesData) && statesData.length > 0 
    ? Math.min(...statesData.map(d => d.value)) 
    : 0;
  const maxValue = statesData && Array.isArray(statesData) && statesData.length > 0 
    ? Math.max(...statesData.map(d => d.value)) 
    : 100;

  if (loading && !geographyData) {
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
      
      {geographyData && statesData && Array.isArray(statesData) && statesData.length > 0 ? (
        <ResponsiveChoropleth
          data={statesData}
          features={geographyData.features}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          colors="blues"
          domain={[minValue || 0, maxValue || 100]}
          unknownColor="#e0e0e0"
          label="properties.name"
          valueFormat=".0f"
          projectionScale={900}
          projectionTranslation={[0.5, 0.5]}
          projectionRotation={[0, 0, 0]}
          enableGraticule={false}
          borderWidth={0.5}
          borderColor="#152538"
          legends={[
            {
              anchor: 'bottom-left',
              direction: 'column',
              justify: true,
              translateX: 20,
              translateY: -20,
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
          tooltip={(input) => {
            const feature = input.feature;
            // Acesse o id da feature através de properties.id ou outro atributo disponível
            const featureId = feature.properties?.id || feature.properties?.code || feature.id;
            const state = Array.isArray(statesData) ? statesData.find(s => s.id === featureId) : undefined;
            
            if (!state) return null;
            
            return (
              <div className="bg-white p-2 shadow-md rounded-md">
                <strong>{state.name}</strong>
                <div>Envios: {state.value}</div>
              </div>
            );
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default BrasilShipmentMap;