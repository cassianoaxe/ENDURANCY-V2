import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, Card } from '@/components/ui';
import { ResponsiveChoropleth } from '@nivo/geo';
// Importação do arquivo GeoJSON
import brasilGeoData from './brasil-geo-complete.json';
import { Loader2 } from 'lucide-react';

interface StateDataItem {
  id: string;
  name: string;
  value: number;
}

interface BrasilShipmentMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  className?: string;
  fullscreen?: boolean;
}

// Dados geográficos estão disponíveis diretamente
const geoFeatures = brasilGeoData;

const BrasilShipmentMap: React.FC<BrasilShipmentMapProps> = ({ 
  period, 
  className = '',
  fullscreen = false 
}) => {
  const [statesData, setStatesData] = useState<StateDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados de expedição por estado
  useEffect(() => {
    const fetchShipmentsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/expedicao/envios-por-estado/${period}`);
        
        // Forçando para garantir que estamos recebendo um array válido
        let dataArray = Array.isArray(response.data) ? response.data : [];
        
        // Garantir que os dados estão no formato correto para o mapa
        // Com o ID usando a sigla do estado (AC, SP, etc)
        if (dataArray.length > 0) {
          dataArray = dataArray.map(item => ({
            ...item,
            id: item.id.toUpperCase() // Para garantir que o ID está em maiúsculo para o match
          }));
        } else {
          // Se não houver dados, inicializamos com array vazio
          dataArray = [];
        }
        
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

  // Definir altura do mapa com base no modo fullscreen
  const mapHeight = fullscreen 
    ? "h-[calc(100vh-180px)]" 
    : "h-[550px]";

  // Definir escala de projeção com base no modo fullscreen
  const projectionScale = fullscreen ? 1350 : 1100;

  // Componente de carregamento
  const LoadingState = () => (
    <div className={`flex items-center justify-center ${mapHeight}`}>
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 text-lg">Carregando dados do mapa...</p>
      </div>
    </div>
  );

  // Componente de erro
  const ErrorState = () => (
    <div className={`flex items-center justify-center ${mapHeight}`}>
      <div className="text-center">
        <p className="text-red-500 text-xl mb-3">{error}</p>
        <p className="text-gray-500 mb-4">Não foi possível carregar o mapa de expedição.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      <Heading as="h2" size="xl" weight="semibold" className="mb-4 text-center">
        Distribuição de Envios por Estado
      </Heading>
      
      <Card className="p-0 overflow-hidden border-gray-200 shadow-lg">
        <div className={`${mapHeight} relative`}>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : (
            <ResponsiveChoropleth
              data={statesData}
              features={geoFeatures.features}
              margin={{ top: 40, right: 40, bottom: 80, left: 40 }}
              colors="blues"
              domain={[minValue, maxValue]}
              unknownColor="#e0e0e0"
              label="properties.name"
              valueFormat=".0f"
              projectionScale={projectionScale}
              projectionTranslation={[0.5, 0.55]}
              projectionRotation={[0, 0, 0]}
              enableGraticule={false}
              borderWidth={0.5}
              borderColor="#152538"
              fillColor="#f5f5f5"
              match={(feature, datum) => {
                // @ts-ignore - Mapear a sigla do estado (AC, SP, etc) ao id dos dados
                return feature.properties.sigla === datum.id;
              }}
              theme={{
                background: "transparent",
                text: {
                  fontSize: fullscreen ? 14 : 12,
                  fill: "#333333",
                  fontWeight: 600
                }
              }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: true,
                  translateX: 0,
                  translateY: 60,
                  itemsSpacing: 10,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemTextColor: '#444',
                  itemOpacity: 0.85,
                  symbolSize: 20,
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
                // @ts-ignore
                const featureId = feature.properties?.sigla || '';
                const state = statesData.find(s => s.id === featureId);
                // @ts-ignore
                const stateName = feature.properties?.name || 'Estado';
                
                return (
                  <div className="bg-white p-4 shadow-lg rounded-md border border-gray-100">
                    <strong className="text-gray-900 block mb-2 text-lg">
                      {state?.name || stateName}
                    </strong>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium text-lg">
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
        <div className="py-3 px-4 bg-gray-50 border-t border-gray-200 flex justify-center">
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