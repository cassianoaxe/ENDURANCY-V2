import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heading, Card } from '@/components/ui';
import { ResponsiveChoropleth } from '@nivo/geo';
import { Loader2 } from 'lucide-react';

// Importação direta de GeoJSON
import brasilGeoData from './brasil-geo.json';

interface ShipmentMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  className?: string;
  fullscreen?: boolean;
}

interface StateData {
  id: string;
  name: string;
  value: number;
}

const BrasilShipmentMapSimple: React.FC<ShipmentMapProps> = ({ 
  period, 
  className = '',
  fullscreen = false 
}) => {
  const [data, setData] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carregamento para dar uma experiência de UI melhor
    setLoading(true);
    setTimeout(() => {
      // Utilizando apenas dados mock para visualização
      // Estes são dados de exemplo de distribuição de envios por estado
      const mockData = [
        { id: "SP", name: "São Paulo", value: 1254 },
        { id: "RJ", name: "Rio de Janeiro", value: 987 },
        { id: "MG", name: "Minas Gerais", value: 765 },
        { id: "RS", name: "Rio Grande do Sul", value: 651 },
        { id: "PR", name: "Paraná", value: 580 },
        { id: "BA", name: "Bahia", value: 542 },
        { id: "SC", name: "Santa Catarina", value: 498 },
        { id: "PE", name: "Pernambuco", value: 410 },
        { id: "CE", name: "Ceará", value: 385 },
        { id: "GO", name: "Goiás", value: 340 },
        { id: "PA", name: "Pará", value: 280 },
        { id: "ES", name: "Espírito Santo", value: 220 },
        { id: "DF", name: "Distrito Federal", value: 210 },
        { id: "MT", name: "Mato Grosso", value: 170 },
        { id: "MS", name: "Mato Grosso do Sul", value: 160 },
        { id: "MA", name: "Maranhão", value: 150 },
        { id: "AM", name: "Amazonas", value: 125 },
        { id: "RN", name: "Rio Grande do Norte", value: 120 },
        { id: "PI", name: "Piauí", value: 110 },
        { id: "PB", name: "Paraíba", value: 105 },
        { id: "AL", name: "Alagoas", value: 90 },
        { id: "SE", name: "Sergipe", value: 75 },
        { id: "TO", name: "Tocantins", value: 60 },
        { id: "RO", name: "Rondônia", value: 50 },
        { id: "AC", name: "Acre", value: 35 },
        { id: "AP", name: "Amapá", value: 30 },
        { id: "RR", name: "Roraima", value: 20 }
      ];

      setData(mockData);
      setError(null);
      setLoading(false);
    }, 800);
  }, [period]);

  // Cálculo de valores mínimo e máximo para a escala de cores
  const minValue = data.length > 0 ? Math.min(...data.map(d => d.value)) : 0;
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 100;

  // Altura adequada baseada no modo
  const mapHeight = fullscreen ? "h-[calc(100vh-200px)]" : "h-[500px]";
  const projectionScale = fullscreen ? 1500 : 1000;

  if (loading) {
    return (
      <div className={`w-full ${mapHeight} flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${mapHeight} flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Card className={`shadow-md overflow-hidden ${fullscreen ? 'border-2 border-primary/20' : ''}`}>
        <div className="p-4 bg-white">
          <Heading as="h2" size="lg" weight="semibold" className="mb-4 text-center">
            Distribuição de Envios por Estado
          </Heading>
        </div>
        
        <div className={mapHeight}>
          <ResponsiveChoropleth
            data={data}
            features={brasilGeoData.features}
            margin={{ top: 30, right: 30, bottom: 60, left: 30 }}
            colors="blues"
            domain={[minValue, maxValue]}
            unknownColor="#e0e0e0"
            label="properties.name"
            valueFormat=".0f"
            projectionScale={projectionScale}
            projectionTranslation={[0.5, 0.55]}
            borderWidth={0.5}
            borderColor="#152538"
            match={(feature, datum) => {
              // Mapear a sigla do estado (AC, SP, etc) ao id dos dados
              // @ts-ignore
              return feature.properties.sigla === datum.id;
            }}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: true,
                translateX: 0,
                translateY: 50,
                itemsSpacing: 10,
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
              // @ts-ignore
              const featureId = feature.properties?.sigla || '';
              const stateData = data.find(d => d.id === featureId);
              // @ts-ignore
              const stateName = feature.properties?.name || 'Estado';
              
              return (
                <div className="bg-white p-3 shadow-lg rounded-md border border-gray-100">
                  <strong className="text-gray-900 block mb-1">{stateData?.name || stateName}</strong>
                  <div className="flex items-center">
                    <span className="text-blue-600 font-medium">
                      {stateData ? `${stateData.value} envios` : 'Sem dados'}
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </div>
        
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

export default BrasilShipmentMapSimple;