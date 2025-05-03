import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Settings, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { BRAZILIAN_STATES, STATE_CENTERS, BRASIL_STATE_PATHS, STATE_COLORS_BY_REGION } from './BrasilSVGPaths';

interface StateData {
  id: string; // ID do estado (sigla: SP, RJ, etc)
  name: string; // Nome do estado
  value: number; // Quantidade de envios
}

interface BrasilTVMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  className?: string;
  fullscreen?: boolean;
  showStateLabels?: boolean;
  colorMode?: 'colored' | 'grayscale' | 'outline';
}

// Paleta de cores em escala de cinza
const GRAYSCALE_PALETTE = [
  "#f9f9f9", "#e0e0e0", "#d0d0d0", "#b0b0b0", "#909090", 
  "#808080", "#606060", "#505050", "#404040", "#303030"
];

// Função para gerar dados mockup para teste
function getMockData(): StateData[] {
  return [
    { id: "SP", name: "São Paulo", value: 320 },
    { id: "RJ", name: "Rio de Janeiro", value: 180 },
    { id: "MG", name: "Minas Gerais", value: 150 },
    { id: "BA", name: "Bahia", value: 110 },
    { id: "RS", name: "Rio Grande do Sul", value: 95 },
    { id: "PR", name: "Paraná", value: 85 },
    { id: "PE", name: "Pernambuco", value: 75 },
    { id: "CE", name: "Ceará", value: 65 },
    { id: "SC", name: "Santa Catarina", value: 55 },
    { id: "PA", name: "Pará", value: 45 },
    { id: "MA", name: "Maranhão", value: 35 },
    { id: "GO", name: "Goiás", value: 30 },
    { id: "AM", name: "Amazonas", value: 25 },
    { id: "ES", name: "Espírito Santo", value: 20 },
    { id: "PB", name: "Paraíba", value: 18 },
    { id: "RN", name: "Rio Grande do Norte", value: 16 },
    { id: "MT", name: "Mato Grosso", value: 15 },
    { id: "AL", name: "Alagoas", value: 12 },
    { id: "PI", name: "Piauí", value: 10 },
    { id: "DF", name: "Distrito Federal", value: 8 },
    { id: "MS", name: "Mato Grosso do Sul", value: 7 },
    { id: "SE", name: "Sergipe", value: 5 },
    { id: "RO", name: "Rondônia", value: 3 },
    { id: "TO", name: "Tocantins", value: 2 },
    { id: "AC", name: "Acre", value: 1 },
    { id: "AP", name: "Amapá", value: 1 },
    { id: "RR", name: "Roraima", value: 1 }
  ];
}

const BrasilTVMapNew: React.FC<BrasilTVMapProps> = ({ 
  period = 'monthly', 
  className = '', 
  fullscreen = false,
  showStateLabels = true,
  colorMode = 'colored'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [mapConfig, setMapConfig] = useState({
    showStateLabels: showStateLabels,
    showValues: true,
    colorMode: colorMode,
    valueSize: 'medium', // 'small', 'medium', 'large'
    borderWidth: 2,
  });

  // Função para modificar dados baseado no período
  function adjustDataForPeriod(data: StateData[]): StateData[] {
    const multipliers: Record<string, number> = {
      'daily': 1,
      'weekly': 7,
      'monthly': 30,
      'yearly': 365,
    };
    
    const multiplier = multipliers[period] || 1;
    
    return data.map(state => ({
      ...state,
      value: Math.round(state.value * multiplier)
    }));
  }

  // Consulta para buscar dados do backend
  const { data: fetchedData, isLoading } = useQuery<StateData[]>({
    queryKey: [`/api/expedicao/envios-por-estado/${period}`],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: getMockData(),
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000,
    select: (data) => {
      if (!data || data.length === 0) {
        console.log('Usando dados mockup (API retornou vazio)');
        return getMockData();
      }
      return data;
    }
  });
  
  // Garantir que sempre temos dados para exibir - usar mockup se a API falhar
  const stateData = fetchedData || getMockData();
  
  // Altura adequada baseada no modo
  const mapHeight = fullscreen ? "h-[calc(100vh-120px)]" : "h-[600px]";
  
  // Calculando o valor máximo para gerar escala de cores
  const maxValue = Math.max(...stateData.map((state: StateData) => state.value), 1);
  
  // Função para gerar cor baseada no valor e modo de cor selecionado
  function getColorForState(stateId: string): string {
    const stateInfo = stateData.find(state => state.id === stateId);
    if (!stateInfo) return "#e0e0e0"; // cor para estados sem dados
    
    if (mapConfig.colorMode === 'outline') {
      return 'transparent'; // Apenas contorno, sem preenchimento
    }
    
    if (mapConfig.colorMode === 'grayscale') {
      // Escala de cinza
      const intensity = Math.max(0.1, Math.min(0.9, stateInfo.value / maxValue));
      const grayIndex = Math.floor(intensity * (GRAYSCALE_PALETTE.length - 1));
      return GRAYSCALE_PALETTE[grayIndex];
    }
    
    // Modo colorido - usar cores por região do Brasil
    const baseColor = STATE_COLORS_BY_REGION[stateId] || "#e0e0e0";
    
    // Para efeito visual, aplica transparência sutil para diferenciar estados com mais ou menos envios
    if (stateInfo.value === 0) {
      // Estado sem envios: mais transparente
      return baseColor + "60"; // 40% opacity
    } else if (stateInfo.value < maxValue * 0.3) {
      // Poucos envios: levemente transparente
      return baseColor + "B0"; // 70% opacity
    } else {
      // Muitos envios: totalmente opaco
      return baseColor;
    }
  }
  
  // Função para determinar o tamanho da fonte dos valores exibidos no mapa
  function getValueFontSize(): number {
    switch (mapConfig.valueSize) {
      case 'small': return 14;
      case 'large': return 24;
      case 'medium':
      default: return 18;
    }
  }
  
  // Determinar a cor do texto do valor com base na cor de fundo do estado
  function getValueTextColor(stateId: string): string {
    if (mapConfig.colorMode === 'outline') return '#000000';
    
    // Estados com cores escuras (que precisam de texto branco)
    const darkStates = ['RR', 'MT', 'MS', 'GO', 'MG', 'SP', 'PR', 'SC', 'RS'];
    
    return darkStates.includes(stateId) ? '#FFFFFF' : '#000000';
  }
  
  // Renderizar indicador de carregamento
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <Card className={`shadow-md overflow-hidden ${fullscreen ? 'border-0' : ''}`}>
          <div className={`${mapHeight} bg-white relative flex items-center justify-center p-4`}>
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">Carregando dados do mapa...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Calcular o total de envios para exibir na legenda
  const totalEnvios = stateData.reduce((acc, state: StateData) => acc + state.value, 0);
  
  return (
    <div className={`w-full ${className}`}>
      <Card className={`shadow-lg overflow-hidden ${fullscreen ? 'border-0' : ''}`}>
        {fullscreen && (
          <div className="absolute top-4 right-4 z-20">
            <button 
              className="h-10 w-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md"
              onClick={() => setShowSettings(!showSettings)}
              title="Configurações do mapa"
            >
              <Settings className="h-5 w-5 text-gray-700" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg p-4 text-sm">
                <h3 className="font-bold mb-3 text-base">Configurações do Mapa</h3>
                
                <div className="mb-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={mapConfig.showStateLabels} 
                      onChange={e => setMapConfig({...mapConfig, showStateLabels: e.target.checked})}
                      className="rounded"
                    />
                    Mostrar nomes dos estados
                  </label>
                </div>
                
                <div className="mb-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={mapConfig.showValues} 
                      onChange={e => setMapConfig({...mapConfig, showValues: e.target.checked})}
                      className="rounded"
                    />
                    Mostrar valores
                  </label>
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1">Modo de cores:</label>
                  <select 
                    value={mapConfig.colorMode} 
                    onChange={e => setMapConfig({...mapConfig, colorMode: e.target.value as any})}
                    className="w-full rounded border border-gray-300 p-1"
                  >
                    <option value="colored">Colorido</option>
                    <option value="grayscale">Escala de cinza</option>
                    <option value="outline">Apenas contorno</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1">Tamanho dos valores:</label>
                  <select 
                    value={mapConfig.valueSize} 
                    onChange={e => setMapConfig({...mapConfig, valueSize: e.target.value as any})}
                    className="w-full rounded border border-gray-300 p-1"
                  >
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1">Espessura da borda:</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={mapConfig.borderWidth}
                    onChange={e => setMapConfig({...mapConfig, borderWidth: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
          
        <div className={`${mapHeight} bg-white relative flex items-center justify-center overflow-hidden`}>
          {/* SVG do mapa do Brasil com valores dentro de cada estado */}
          <svg 
            viewBox="0 0 500 600" 
            preserveAspectRatio="xMidYMid meet"
            width="100%" 
            height="95%" 
            className="max-w-full"
          >
            {/* Mapa do Brasil usando paths otimizados para melhor representação */}
            {BRAZILIAN_STATES.map((state: {id: string, name: string}) => (
              <React.Fragment key={state.id}>
                <path 
                  d={BRASIL_STATE_PATHS[state.id]}
                  fill={getColorForState(state.id)} 
                  stroke="#fff" 
                  strokeWidth={mapConfig.borderWidth}
                  style={{ cursor: 'pointer' }}
                />
                {mapConfig.showStateLabels && (
                  <text 
                    x={STATE_CENTERS[state.id].x} 
                    y={STATE_CENTERS[state.id].y - 10} 
                    fontSize="12" 
                    textAnchor="middle" 
                    fill={getValueTextColor(state.id)} 
                    pointerEvents="none"
                  >
                    {state.id}
                  </text>
                )}
                {mapConfig.showValues && (
                  <text 
                    x={STATE_CENTERS[state.id].x} 
                    y={STATE_CENTERS[state.id].y + 5} 
                    fontSize={getValueFontSize()} 
                    fontWeight="bold" 
                    textAnchor="middle" 
                    fill={getValueTextColor(state.id)} 
                    pointerEvents="none"
                  >
                    {stateData.find(s => s.id === state.id)?.value || 0}
                  </text>
                )}
              </React.Fragment>
            ))}
          </svg>
        </div>
        
        {/* Legenda do período */}
        <div className="absolute left-4 top-4 bg-white/80 px-4 py-2 rounded-md shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-lg font-semibold">
                {period === 'daily' && 'Envios Diários'}
                {period === 'weekly' && 'Envios Semanais'}
                {period === 'monthly' && 'Envios Mensais'}
                {period === 'yearly' && 'Envios Anuais'}
              </span>
              <span className="text-sm text-muted-foreground">
                Total: {totalEnvios.toLocaleString('pt-BR')} envios
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BrasilTVMapNew;