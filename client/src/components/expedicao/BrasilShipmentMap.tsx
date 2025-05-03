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
        console.log('Iniciando requisição para dados de expedição, período:', period);
        const response = await axios.get(`/api/expedicao/shipments-by-state?period=${period}`);
        console.log('Dados recebidos:', response.data);
        console.log('Tipo de dados:', typeof response.data, Array.isArray(response.data));
        
        // Forçando para garantir que estamos recebendo um array válido
        const dataArray = Array.isArray(response.data) ? response.data : [];
        console.log('Dados após verificação de array:', dataArray);
        
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
  
  try {
    if (statesData && Array.isArray(statesData) && statesData.length > 0) {
      const values = statesData.map(d => d.value);
      minValue = Math.min(...values);
      maxValue = Math.max(...values);
    }
  } catch (err) {
    console.error('Erro ao calcular valores min/max:', err);
  }

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
            console.log('Feature recebida no tooltip:', feature);
            
            // Tentar extrair ID da feature com validações
            let featureId;
            try {
              // @ts-ignore - ignorando erros de tipagem
              featureId = feature.properties?.id || feature.properties?.code || feature.id;
              console.log('Feature ID identificado:', featureId);
            } catch (err) {
              console.error('Erro ao extrair ID da feature:', err);
              return null;
            }
            
            // Tentar encontrar o estado correspondente
            let state;
            try {
              state = Array.isArray(statesData) ? statesData.find(s => s.id === featureId) : undefined;
              console.log('Estado encontrado:', state);
            } catch (err) {
              console.error('Erro ao buscar estado:', err);
              return null;
            }
            
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