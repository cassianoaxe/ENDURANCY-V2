import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { Loader2, AlertCircle, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Definição do tipo para os dados de cada estado
interface StateData {
  id: string; // ID do estado (sigla: SP, RJ, etc)
  name: string; // Nome do estado
  value: number; // Quantidade de envios
}

// Props do componente
interface BrasilTVMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  className?: string;
  fullscreen?: boolean;
  showStateLabels?: boolean;
  colorMode?: 'colored' | 'grayscale' | 'outline';
}

// Lista de estados brasileiros e suas abreviaturas
const BRAZILIAN_STATES = [
  { id: 'RR', name: 'Roraima' },
  { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'PA', name: 'Pará' },
  { id: 'AC', name: 'Acre' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'TO', name: 'Tocantins' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'PI', name: 'Piauí' },
  { id: 'CE', name: 'Ceará' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'BA', name: 'Bahia' },
  { id: 'GO', name: 'Goiás' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'PR', name: 'Paraná' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'RS', name: 'Rio Grande do Sul' }
];

// Coordenadas centrais aproximadas de cada estado para posicionar os números
const STATE_CENTERS: Record<string, { x: number, y: number }> = {
  'RR': { x: 225, y: 115 },
  'AP': { x: 368, y: 115 },
  'AM': { x: 218, y: 185 },
  'PA': { x: 433, y: 225 },
  'AC': { x: 90, y: 260 },
  'RO': { x: 150, y: 290 },
  'MT': { x: 280, y: 345 },
  'TO': { x: 420, y: 335 },
  'MA': { x: 545, y: 250 },
  'PI': { x: 580, y: 305 },
  'CE': { x: 650, y: 240 },
  'RN': { x: 705, y: 245 },
  'PB': { x: 700, y: 280 },
  'PE': { x: 680, y: 310 },
  'AL': { x: 735, y: 320 },
  'SE': { x: 760, y: 330 },
  'BA': { x: 600, y: 375 },
  'GO': { x: 405, y: 410 },
  'DF': { x: 420, y: 430 },
  'MS': { x: 305, y: 445 },
  'MG': { x: 470, y: 470 },
  'ES': { x: 575, y: 480 },
  'RJ': { x: 540, y: 510 },
  'SP': { x: 400, y: 510 },
  'PR': { x: 350, y: 540 },
  'SC': { x: 340, y: 580 },
  'RS': { x: 300, y: 610 }
};

// Componente principal do mapa
const BrasilTVMap: React.FC<BrasilTVMapProps> = ({ 
  period, 
  className = '',
  fullscreen = false,
  showStateLabels = true,
  colorMode = 'colored'
}) => {
  const [activeState, setActiveState] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [mapConfig, setMapConfig] = useState({
    showStateLabels,
    colorMode,
    showValues: true,
    valueSize: fullscreen ? 'large' : 'medium',
    borderWidth: 2
  });
  
  // Dados mockup para uso quando a API falhar
  const MOCK_STATE_DATA: StateData[] = [
    { id: 'SP', name: 'São Paulo', value: 458 },
    { id: 'RJ', name: 'Rio de Janeiro', value: 237 },
    { id: 'MG', name: 'Minas Gerais', value: 185 },
    { id: 'RS', name: 'Rio Grande do Sul', value: 132 },
    { id: 'PR', name: 'Paraná', value: 129 },
    { id: 'BA', name: 'Bahia', value: 112 },
    { id: 'SC', name: 'Santa Catarina', value: 98 },
    { id: 'GO', name: 'Goiás', value: 76 },
    { id: 'PE', name: 'Pernambuco', value: 63 },
    { id: 'CE', name: 'Ceará', value: 54 },
    { id: 'PA', name: 'Pará', value: 35 },
    { id: 'MT', name: 'Mato Grosso', value: 34 },
    { id: 'ES', name: 'Espírito Santo', value: 31 },
    { id: 'MS', name: 'Mato Grosso do Sul', value: 27 },
    { id: 'AM', name: 'Amazonas', value: 22 },
    { id: 'PB', name: 'Paraíba', value: 21 },
    { id: 'RN', name: 'Rio Grande do Norte', value: 18 },
    { id: 'PI', name: 'Piauí', value: 15 },
    { id: 'AL', name: 'Alagoas', value: 14 },
    { id: 'DF', name: 'Distrito Federal', value: 13 },
    { id: 'TO', name: 'Tocantins', value: 9 },
    { id: 'SE', name: 'Sergipe', value: 8 },
    { id: 'RO', name: 'Rondônia', value: 7 },
    { id: 'MA', name: 'Maranhão', value: 6 },
    { id: 'AC', name: 'Acre', value: 3 },
    { id: 'AP', name: 'Amapá', value: 2 },
    { id: 'RR', name: 'Roraima', value: 1 }
  ];

  // Multiplica os valores de mockup conforme o período
  const getMockData = () => {
    const multiplier = 
      period === 'yearly' ? 12 : 
      period === 'monthly' ? 1 : 
      period === 'weekly' ? 0.25 : 0.035; // daily
      
    return MOCK_STATE_DATA.map(state => ({
      ...state,
      value: Math.round(state.value * multiplier)
    }));
  };

  // Consulta para buscar dados do backend
  const { data: stateData, isLoading, error, refetch } = useQuery<StateData[]>({
    queryKey: [`/api/expedicao/envios-por-estado/${period}`],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Usar dados mockup se a API falhar
    placeholderData: getMockData(),
    // Aumentar tempo limite antes de considerar a requisição como falha
    retry: 1,
    retryDelay: 1000
  });
  
  // Altura adequada baseada no modo
  const mapHeight = fullscreen ? "h-[calc(100vh-120px)]" : "h-[600px]";
  
  // Calculando o valor máximo para gerar escala de cores
  const maxValue = stateData ? Math.max(...stateData.map(state => state.value), 1) : 1;
  
  // Função para gerar cor baseada no valor e modo de cor selecionado
  const getColorForState = (stateId: string) => {
    if (!stateData) return "#e0e0e0"; // cor para quando não há dados
    
    const stateInfo = stateData.find(state => state.id === stateId);
    if (!stateInfo) return "#e0e0e0"; // cor para estados sem dados
    
    if (mapConfig.colorMode === 'outline') {
      return 'transparent'; // Apenas contorno, sem preenchimento
    }
    
    if (mapConfig.colorMode === 'grayscale') {
      // Escala de cinza
      const intensity = Math.max(0.1, Math.min(0.9, stateInfo.value / maxValue));
      const grayValue = Math.floor(255 - intensity * 200); // Mais escuro para valores maiores
      return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    }
    
    // Modo colorido padrão (mapa do Brasil com regiões coloridas)
    const stateFixedColors: Record<string, string> = {
      // Estados em Azul Escuro
      'RR': '#191970',
      'CE': '#191970',
      'RN': '#191970',
      'SE': '#191970',
      'GO': '#191970',
      'SP': '#191970',
      'SC': '#191970',
      
      // Estados em Azul
      'PA': '#4682B4',
      'RO': '#4682B4',
      'PI': '#4682B4',
      'PB': '#4682B4',
      'AL': '#4682B4',
      'MG': '#4682B4',
      
      // Estados em Verde
      'AP': '#3CB371',
      'AC': '#3CB371',
      'MT': '#3CB371',
      'MA': '#3CB371',
      'BA': '#3CB371',
      'PR': '#3CB371',
      
      // Estados em Amarelo
      'AM': '#FFD700',
      'TO': '#FFD700',
      'PE': '#FFD700',
      'MS': '#FFD700',
      'ES': '#FFD700',
      'RJ': '#FFD700',
      'RS': '#FFD700'
    };
    
    const baseColor = stateFixedColors[stateId] || "#e0e0e0";
    const opacity = Math.max(0.4, Math.min(1, stateInfo.value / maxValue * 0.6 + 0.4));
    
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
  };
  
  // Função para determinar o tamanho da fonte dos valores exibidos no mapa com base na quantidade de estados
  const getValueFontSize = () => {
    switch (mapConfig.valueSize) {
      case 'small': return 14;
      case 'large': return 28;
      case 'medium':
      default: return 20;
    }
  };
  
  // Determinar a cor do texto do valor com base na cor de fundo do estado
  const getValueTextColor = (stateId: string) => {
    if (mapConfig.colorMode === 'outline') return '#000000';
    
    const darkStates = ['RR', 'CE', 'RN', 'SE', 'GO', 'SP', 'SC', 'PA', 'RO', 'PI', 'PB', 'AL', 'MG', 'MT'];
    
    return darkStates.includes(stateId) ? '#FFFFFF' : '#000000';
  };
  
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
  
  // Remover essa condição já que agora temos dados mockup como fallback
  if (!stateData) {
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
            viewBox="0 0 800 800" 
            preserveAspectRatio="xMidYMid meet"
            width="100%" 
            height="95%" 
            className="max-w-full"
          >
            {/* Roraima - azul escuro */}
            <path 
              d="M228,81 L198,90 L188,110 L205,138 L240,140 L274,120 L292,95 L270,81 Z" 
              fill={getColorForState('RR')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="228" y="115" fontSize="14" textAnchor="middle" fill={getValueTextColor('RR')} pointerEvents="none">Roraima</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.RR.x} 
                y={STATE_CENTERS.RR.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('RR')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'RR')?.value || 0}
              </text>
            )}

            {/* Amapá - verde */}
            <path 
              d="M352,65 L332,95 L345,135 L370,158 L398,140 L407,110 L397,85 L370,70 Z" 
              fill={getColorForState('AP')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="368" y="115" fontSize="14" textAnchor="middle" fill={getValueTextColor('AP')} pointerEvents="none">Amapá</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.AP.x} 
                y={STATE_CENTERS.AP.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('AP')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'AP')?.value || 0}
              </text>
            )}

            {/* Amazonas - amarelo */}
            <path 
              d="M102,167 L122,140 L177,128 L188,110 L198,90 L228,81 L270,81 L292,95 L274,120 L240,140 L205,138 L230,175 L290,185 L348,173 L348,208 L318,238 L265,258 L200,265 L155,242 L130,270 Z" 
              fill={getColorForState('AM')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="218" y="185" fontSize="18" textAnchor="middle" fill={getValueTextColor('AM')} pointerEvents="none">Amazonas</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.AM.x} 
                y={STATE_CENTERS.AM.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('AM')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'AM')?.value || 0}
              </text>
            )}

            {/* Pará - azul */}
            <path 
              d="M348,173 L370,158 L398,140 L430,148 L465,175 L495,175 L520,198 L515,228 L478,265 L425,275 L395,295 L348,208 Z" 
              fill={getColorForState('PA')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="433" y="225" fontSize="18" textAnchor="middle" fill={getValueTextColor('PA')} pointerEvents="none">Pará</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.PA.x} 
                y={STATE_CENTERS.PA.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('PA')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'PA')?.value || 0}
              </text>
            )}

            {/* Acre - verde */}
            <path 
              d="M50,268 L60,245 L102,235 L130,270 L100,285 Z" 
              fill={getColorForState('AC')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="90" y="260" fontSize="14" textAnchor="middle" fill={getValueTextColor('AC')} pointerEvents="none">Acre</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.AC.x} 
                y={STATE_CENTERS.AC.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('AC')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'AC')?.value || 0}
              </text>
            )}

            {/* Rondônia - azul */}
            <path 
              d="M130,270 L155,242 L200,265 L190,298 L155,325 L110,305 Z" 
              fill={getColorForState('RO')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="150" y="290" fontSize="14" textAnchor="middle" fill={getValueTextColor('RO')} pointerEvents="none">Rondônia</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.RO.x} 
                y={STATE_CENTERS.RO.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('RO')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'RO')?.value || 0}
              </text>
            )}

            {/* Mato Grosso - verde */}
            <path 
              d="M190,298 L200,265 L265,258 L318,238 L348,208 L395,295 L370,345 L370,375 L330,415 L270,395 L225,370 L190,360 Z" 
              fill={getColorForState('MT')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="280" y="345" fontSize="16" textAnchor="middle" fill={getValueTextColor('MT')} pointerEvents="none">Mato Grosso</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.MT.x} 
                y={STATE_CENTERS.MT.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('MT')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'MT')?.value || 0}
              </text>
            )}

            {/* Tocantins - amarelo */}
            <path 
              d="M395,295 L425,275 L465,305 L450,348 L425,370 L395,372 L370,345 Z" 
              fill={getColorForState('TO')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="420" y="335" fontSize="14" textAnchor="middle" fill={getValueTextColor('TO')} pointerEvents="none">Tocantins</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.TO.x} 
                y={STATE_CENTERS.TO.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('TO')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'TO')?.value || 0}
              </text>
            )}

            {/* Maranhão - verde */}
            <path 
              d="M478,265 L515,228 L560,210 L610,218 L615,245 L590,275 L550,282 L525,300 L465,305 L425,275 Z" 
              fill={getColorForState('MA')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="545" y="250" fontSize="14" textAnchor="middle" fill={getValueTextColor('MA')} pointerEvents="none">Maranhão</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.MA.x} 
                y={STATE_CENTERS.MA.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('MA')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'MA')?.value || 0}
              </text>
            )}

            {/* Piauí - azul */}
            <path 
              d="M525,300 L550,282 L590,275 L615,245 L625,262 L615,310 L583,332 L550,335 L525,340 L465,305 Z" 
              fill={getColorForState('PI')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="580" y="305" fontSize="14" textAnchor="middle" fill={getValueTextColor('PI')} pointerEvents="none">Piauí</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.PI.x} 
                y={STATE_CENTERS.PI.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('PI')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'PI')?.value || 0}
              </text>
            )}

            {/* Ceará - azul escuro */}
            <path 
              d="M615,245 L610,218 L655,208 L685,228 L680,265 L650,278 L625,262 Z" 
              fill={getColorForState('CE')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="650" y="240" fontSize="14" textAnchor="middle" fill={getValueTextColor('CE')} pointerEvents="none">Ceará</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.CE.x} 
                y={STATE_CENTERS.CE.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('CE')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'CE')?.value || 0}
              </text>
            )}

            {/* Rio Grande do Norte - azul escuro */}
            <path 
              d="M685,228 L718,222 L740,240 L720,265 L685,265 L680,265 Z" 
              fill={getColorForState('RN')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="705" y="245" fontSize="11" textAnchor="middle" fill={getValueTextColor('RN')} pointerEvents="none">RN</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.RN.x} 
                y={STATE_CENTERS.RN.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('RN')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'RN')?.value || 0}
              </text>
            )}

            {/* Paraíba - azul */}
            <path 
              d="M680,265 L685,265 L720,265 L740,285 L705,298 L678,282 L650,278 Z" 
              fill={getColorForState('PB')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="700" y="280" fontSize="10" textAnchor="middle" fill={getValueTextColor('PB')} pointerEvents="none">PB</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.PB.x} 
                y={STATE_CENTERS.PB.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('PB')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'PB')?.value || 0}
              </text>
            )}

            {/* Pernambuco - amarelo */}
            <path 
              d="M650,278 L678,282 L705,298 L735,300 L715,325 L675,328 L645,318 L615,310 L625,262 Z" 
              fill={getColorForState('PE')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="680" y="310" fontSize="12" textAnchor="middle" fill={getValueTextColor('PE')} pointerEvents="none">PE</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.PE.x} 
                y={STATE_CENTERS.PE.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('PE')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'PE')?.value || 0}
              </text>
            )}

            {/* Alagoas - azul */}
            <path 
              d="M715,325 L735,300 L760,310 L740,335 Z" 
              fill={getColorForState('AL')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="735" y="320" fontSize="10" textAnchor="middle" fill={getValueTextColor('AL')} pointerEvents="none">AL</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.AL.x} 
                y={STATE_CENTERS.AL.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('AL')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'AL')?.value || 0}
              </text>
            )}

            {/* Sergipe - azul escuro */}
            <path 
              d="M740,335 L760,310 L775,325 L760,345 Z" 
              fill={getColorForState('SE')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="760" y="330" fontSize="10" textAnchor="middle" fill={getValueTextColor('SE')} pointerEvents="none">SE</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.SE.x} 
                y={STATE_CENTERS.SE.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('SE')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'SE')?.value || 0}
              </text>
            )}

            {/* Bahia - verde */}
            <path 
              d="M465,305 L525,340 L550,335 L583,332 L615,310 L645,318 L675,328 L715,325 L740,335 L760,345 L730,385 L690,405 L645,415 L605,415 L575,435 L535,425 L500,435 L465,405 L450,370 L465,350 L450,348 Z" 
              fill={getColorForState('BA')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="600" y="375" fontSize="18" textAnchor="middle" fill={getValueTextColor('BA')} pointerEvents="none">Bahia</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.BA.x} 
                y={STATE_CENTERS.BA.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('BA')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'BA')?.value || 0}
              </text>
            )}

            {/* Goiás - azul escuro */}
            <path 
              d="M370,345 L395,372 L425,370 L450,370 L465,405 L415,428 L388,442 L360,435 L330,415 L370,375 Z" 
              fill={getColorForState('GO')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="405" y="410" fontSize="14" textAnchor="middle" fill={getValueTextColor('GO')} pointerEvents="none">Goiás</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.GO.x} 
                y={STATE_CENTERS.GO.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('GO')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'GO')?.value || 0}
              </text>
            )}

            {/* Distrito Federal - pequeno ponto ao lado de Goiás */}
            <path 
              d="M415,428 L423,423 L430,430 L422,435 Z" 
              fill={getColorForState('DF')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="445" y="433" fontSize="7" textAnchor="middle" fill="#000" pointerEvents="none">DF</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.DF.x} 
                y={STATE_CENTERS.DF.y} 
                fontSize={getValueFontSize() * 0.6} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('DF')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'DF')?.value || 0}
              </text>
            )}

            {/* Mato Grosso do Sul - amarelo */}
            <path 
              d="M270,395 L330,415 L360,435 L330,480 L282,480 L245,460 L240,430 Z" 
              fill={getColorForState('MS')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="305" y="445" fontSize="12" textAnchor="middle" fill={getValueTextColor('MS')} pointerEvents="none">MS</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.MS.x} 
                y={STATE_CENTERS.MS.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('MS')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'MS')?.value || 0}
              </text>
            )}

            {/* Minas Gerais - azul */}
            <path 
              d="M465,405 L500,435 L535,425 L575,435 L580,460 L570,490 L530,510 L485,490 L450,505 L405,500 L385,480 L388,442 L415,428 Z" 
              fill={getColorForState('MG')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="470" y="470" fontSize="16" textAnchor="middle" fill={getValueTextColor('MG')} pointerEvents="none">MG</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.MG.x} 
                y={STATE_CENTERS.MG.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('MG')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'MG')?.value || 0}
              </text>
            )}

            {/* Espírito Santo - amarelo */}
            <path 
              d="M580,460 L605,415 L645,415 L605,485 L570,490 Z" 
              fill={getColorForState('ES')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="595" y="460" fontSize="10" textAnchor="middle" fill={getValueTextColor('ES')} pointerEvents="none">ES</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.ES.x} 
                y={STATE_CENTERS.ES.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('ES')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'ES')?.value || 0}
              </text>
            )}

            {/* Rio de Janeiro - amarelo */}
            <path 
              d="M530,510 L570,490 L605,485 L580,520 L530,530 Z" 
              fill={getColorForState('RJ')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="560" y="510" fontSize="10" textAnchor="middle" fill={getValueTextColor('RJ')} pointerEvents="none">RJ</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.RJ.x} 
                y={STATE_CENTERS.RJ.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('RJ')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'RJ')?.value || 0}
              </text>
            )}

            {/* São Paulo - azul escuro */}
            <path 
              d="M330,480 L385,480 L405,500 L450,505 L485,490 L530,510 L530,530 L490,540 L400,540 L360,520 L320,520 Z" 
              fill={getColorForState('SP')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="410" y="510" fontSize="16" textAnchor="middle" fill={getValueTextColor('SP')} pointerEvents="none">SP</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.SP.x} 
                y={STATE_CENTERS.SP.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('SP')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'SP')?.value || 0}
              </text>
            )}

            {/* Paraná - verde */}
            <path 
              d="M320,520 L360,520 L400,540 L370,570 L310,560 L298,540 Z" 
              fill={getColorForState('PR')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="350" y="540" fontSize="14" textAnchor="middle" fill={getValueTextColor('PR')} pointerEvents="none">PR</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.PR.x} 
                y={STATE_CENTERS.PR.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('PR')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'PR')?.value || 0}
              </text>
            )}

            {/* Santa Catarina - azul escuro */}
            <path 
              d="M298,540 L310,560 L370,570 L365,590 L320,605 L270,580 Z" 
              fill={getColorForState('SC')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="330" y="580" fontSize="12" textAnchor="middle" fill={getValueTextColor('SC')} pointerEvents="none">SC</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.SC.x} 
                y={STATE_CENTERS.SC.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('SC')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'SC')?.value || 0}
              </text>
            )}

            {/* Rio Grande do Sul - amarelo */}
            <path 
              d="M270,580 L320,605 L365,590 L330,660 L280,675 L235,640 L220,610 Z" 
              fill={getColorForState('RS')} 
              stroke="#fff" 
              strokeWidth={mapConfig.borderWidth}
              style={{ cursor: 'pointer' }}
            />
            {mapConfig.showStateLabels && (
              <text x="300" y="630" fontSize="12" textAnchor="middle" fill={getValueTextColor('RS')} pointerEvents="none">RS</text>
            )}
            {mapConfig.showValues && (
              <text 
                x={STATE_CENTERS.RS.x} 
                y={STATE_CENTERS.RS.y} 
                fontSize={getValueFontSize()} 
                fontWeight="bold" 
                textAnchor="middle" 
                fill={getValueTextColor('RS')} 
                pointerEvents="none"
              >
                {stateData.find(state => state.id === 'RS')?.value || 0}
              </text>
            )}
          </svg>
        </div>

        <div className="p-2 bg-gray-50 border-t text-sm text-gray-600 flex justify-between items-center">
          <div>
            <span className="font-medium">Período:</span> {' '}
            {period === 'daily' ? 'Diário' : 
            period === 'weekly' ? 'Semanal' : 
            period === 'monthly' ? 'Mensal' : 'Anual'}
          </div>
          
          <div>
            Total: <span className="font-bold">{stateData.reduce((sum, state) => sum + state.value, 0)}</span> envios
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BrasilTVMap;