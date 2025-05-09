import React, { useState, useEffect } from 'react';
import { Card, Heading } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Definição do tipo para os dados de cada estado
interface StateData {
  id: string;
  name: string;
  value: number;
}

// Props do componente
interface BrasilMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  className?: string;
  fullscreen?: boolean;
}

// Lista de estados brasileiros e suas abreviaturas para o mapa
const BRAZILIAN_STATES = [
  { id: 'AC', name: 'Acre' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'AP', name: 'Amapá' },
  { id: 'BA', name: 'Bahia' },
  { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'PA', name: 'Pará' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'PI', name: 'Piauí' },
  { id: 'PR', name: 'Paraná' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'RR', name: 'Roraima' },
  { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'TO', name: 'Tocantins' }
];

// Dados padrão para o mapa (serão substituídos por dados do servidor)
const DEFAULT_DATA: StateData[] = [
  { id: "SP", name: "São Paulo", value: 0 },
  { id: "RJ", name: "Rio de Janeiro", value: 0 },
  { id: "MG", name: "Minas Gerais", value: 0 },
  { id: "RS", name: "Rio Grande do Sul", value: 0 },
  { id: "PR", name: "Paraná", value: 0 },
  { id: "BA", name: "Bahia", value: 0 },
  { id: "SC", name: "Santa Catarina", value: 0 },
  { id: "PE", name: "Pernambuco", value: 0 },
  { id: "CE", name: "Ceará", value: 0 },
  { id: "GO", name: "Goiás", value: 0 },
  { id: "PA", name: "Pará", value: 0 },
  { id: "ES", name: "Espírito Santo", value: 0 },
  { id: "DF", name: "Distrito Federal", value: 0 },
  { id: "MT", name: "Mato Grosso", value: 0 },
  { id: "MS", name: "Mato Grosso do Sul", value: 0 },
  { id: "MA", name: "Maranhão", value: 0 },
  { id: "AM", name: "Amazonas", value: 0 },
  { id: "RN", name: "Rio Grande do Norte", value: 0 },
  { id: "PI", name: "Piauí", value: 0 },
  { id: "PB", name: "Paraíba", value: 0 },
  { id: "AL", name: "Alagoas", value: 0 },
  { id: "SE", name: "Sergipe", value: 0 },
  { id: "TO", name: "Tocantins", value: 0 },
  { id: "RO", name: "Rondônia", value: 0 },
  { id: "AP", name: "Amapá", value: 0 },
  { id: "AC", name: "Acre", value: 0 },
  { id: "RR", name: "Roraima", value: 0 }
];

const SimpleBrasilMap: React.FC<BrasilMapProps> = ({ 
  period, 
  className = '',
  fullscreen = false 
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  
  // Consulta para buscar dados do backend
  const { data: stateData, isLoading, error } = useQuery<StateData[]>({
    queryKey: [`/api/expedicao/envios-por-estado/${period}`],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    initialData: DEFAULT_DATA,
  });
  
  // Calculando o valor máximo para gerar escala de cores
  const maxValue = stateData ? Math.max(...stateData.map(state => state.value)) : 1;
  
  // Altura adequada baseada no modo
  const mapHeight = fullscreen ? "h-[calc(100vh-200px)]" : "h-[500px]";
  
  // Função para gerar cor baseada no valor
  const getColorForState = (stateId: string) => {
    if (!stateData) return "#e0e0e0"; // cor para quando não há dados
    
    const stateInfo = stateData.find(state => state.id === stateId);
    if (!stateInfo) return "#e0e0e0"; // cor para estados sem dados
    
    if (maxValue === 0) return "#e0e0e0"; // Evitar divisão por zero
    
    const intensity = Math.floor((stateInfo.value / maxValue) * 100);
    return `rgba(59, 130, 246, ${intensity / 100})`; // Escala de azul com opacidade baseada no valor
  };
  
  // Função para lidar com hover no estado
  const handleStateHover = (stateId: string) => {
    setHoveredState(stateId);
  };
  
  // Função para lidar com o fim do hover
  const handleStateLeave = () => {
    setHoveredState(null);
  };
  
  // Obter dados do estado hovereado
  const hoveredStateData = hoveredState && stateData 
    ? stateData.find(state => state.id === hoveredState) 
    : null;
  
  // Renderizar indicador de carregamento
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <Card className={`shadow-md overflow-hidden ${fullscreen ? 'border-2 border-primary/20' : ''}`}>
          <div className={`${mapHeight} bg-white relative flex items-center justify-center p-4`}>
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando dados do mapa...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <Card className={`shadow-md overflow-hidden ${fullscreen ? 'border-2 border-primary/20' : ''}`}>
          <div className={`${mapHeight} bg-white relative flex items-center justify-center p-4`}>
            <div className="flex flex-col items-center gap-3 max-w-md text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <p className="text-lg font-medium">Erro ao carregar os dados</p>
              <p className="text-muted-foreground">
                Não foi possível carregar os dados de envios por estado. 
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          </div>
        </Card>
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
        
        <div className={`${mapHeight} bg-white relative flex items-center justify-center p-4`}>
          {/* Renderização do mapa SVG do Brasil */}
          <svg 
            viewBox="-75 -33 150 66" 
            width="100%" 
            height="100%" 
            className="max-w-full max-h-full" 
            style={{ 
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))" 
            }}
          >
            {/* Mapa base do Brasil (SVG path simplificado do Brasil) */}
            <path
              d="M-43,5 L-40,0 L-30,-5 L-25,-10 L-20,-15 L-15,-20 L-5,-20 L0,-15 L10,-20 L20,-15 L25,-5 L30,0 L25,10 L20,15 L15,20 L5,25 L0,20 L-5,15 L-15,10 L-25,10 L-35,5 L-43,5 Z"
              fill="#f0f9ff"
              stroke="#ccc"
              strokeWidth="0.5"
            />
            
            {/* Círculos representando os estados */}
            {BRAZILIAN_STATES.map((state) => {
              // Posicionamento aproximado dos estados (simplificado)
              const position = getStatePosition(state.id);
              const stateInfo = stateData.find(s => s.id === state.id);
              const value = stateInfo?.value || 0;
              const radius = Math.max(2, Math.min(5, 2 + (value / maxValue) * 5));
              
              return (
                <g key={state.id}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={radius}
                    fill={getColorForState(state.id)}
                    stroke={hoveredState === state.id ? "#000" : "#fff"}
                    strokeWidth={hoveredState === state.id ? 0.8 : 0.3}
                    onMouseEnter={() => handleStateHover(state.id)}
                    onMouseLeave={handleStateLeave}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  />
                  {hoveredState === state.id && (
                    <text
                      x={position.x}
                      y={position.y - radius - 1}
                      textAnchor="middle"
                      fontSize="3"
                      fill="#333"
                    >
                      {state.id}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Tooltip para o estado com hover */}
            {hoveredState && hoveredStateData && (
              <foreignObject
                x="-50"
                y="-30"
                width="100"
                height="20"
                style={{ 
                  overflow: 'visible', 
                  pointerEvents: 'none' 
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    minWidth: '120px',
                  }}
                >
                  <p style={{ fontWeight: 'bold', margin: '0', fontSize: '14px' }}>
                    {hoveredStateData.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#3b82f6' }}>
                    {hoveredStateData.value} envios
                  </p>
                </div>
              </foreignObject>
            )}
          </svg>
          
          {/* Legenda da escala de cores */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 py-2 px-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-8">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-100 mr-2"></div>
              <span className="text-xs text-gray-600">Baixo</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-300 mr-2"></div>
              <span className="text-xs text-gray-600">Médio</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs text-gray-600">Alto</span>
            </div>
          </div>
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

// Função auxiliar para obter a posição aproximada de cada estado no SVG
const getStatePosition = (stateId: string) => {
  const positions: Record<string, {x: number, y: number}> = {
    'AC': { x: -40, y: -5 },
    'AL': { x: 30, y: 0 },
    'AM': { x: -30, y: -10 },
    'AP': { x: -5, y: -25 },
    'BA': { x: 20, y: 0 },
    'CE': { x: 30, y: -10 },
    'DF': { x: 5, y: 5 },
    'ES': { x: 25, y: 10 },
    'GO': { x: 0, y: 5 },
    'MA': { x: 15, y: -15 },
    'MG': { x: 15, y: 10 },
    'MS': { x: -5, y: 15 },
    'MT': { x: -10, y: 0 },
    'PA': { x: 0, y: -15 },
    'PB': { x: 35, y: -5 },
    'PE': { x: 30, y: -5 },
    'PI': { x: 20, y: -10 },
    'PR': { x: 0, y: 20 },
    'RJ': { x: 20, y: 15 },
    'RN': { x: 35, y: -10 },
    'RO': { x: -25, y: 0 },
    'RR': { x: -20, y: -20 },
    'RS': { x: -5, y: 25 },
    'SC': { x: 0, y: 25 },
    'SE': { x: 30, y: 5 },
    'SP': { x: 10, y: 15 },
    'TO': { x: 5, y: -5 },
  };
  
  return positions[stateId] || { x: 0, y: 0 };
};

export default SimpleBrasilMap;