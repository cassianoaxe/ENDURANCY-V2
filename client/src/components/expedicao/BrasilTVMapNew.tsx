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
    { id: "RJ", name: "Rio de Janeiro", value: 280 },
    { id: "MG", name: "Minas Gerais", value: 210 },
    { id: "RS", name: "Rio Grande do Sul", value: 180 },
    { id: "PR", name: "Paraná", value: 170 },
    { id: "BA", name: "Bahia", value: 140 },
    { id: "SC", name: "Santa Catarina", value: 125 },
    { id: "PE", name: "Pernambuco", value: 110 },
    { id: "CE", name: "Ceará", value: 95 },
    { id: "GO", name: "Goiás", value: 85 },
    { id: "DF", name: "Distrito Federal", value: 75 },
    { id: "AM", name: "Amazonas", value: 65 },
    { id: "PA", name: "Pará", value: 60 },
    { id: "ES", name: "Espírito Santo", value: 55 },
    { id: "MT", name: "Mato Grosso", value: 50 },
    { id: "MS", name: "Mato Grosso do Sul", value: 45 },
    { id: "MA", name: "Maranhão", value: 40 },
    { id: "PB", name: "Paraíba", value: 35 },
    { id: "RN", name: "Rio Grande do Norte", value: 30 },
    { id: "AL", name: "Alagoas", value: 25 },
    { id: "PI", name: "Piauí", value: 20 },
    { id: "SE", name: "Sergipe", value: 18 },
    { id: "TO", name: "Tocantins", value: 15 },
    { id: "RO", name: "Rondônia", value: 12 },
    { id: "AC", name: "Acre", value: 10 },
    { id: "AP", name: "Amapá", value: 8 },
    { id: "RR", name: "Roraima", value: 5 }
  ];
}

const BrasilTVMapNew: React.FC<BrasilTVMapProps> = ({ 
  period, 
  className = '', 
  fullscreen = false,
  showStateLabels = true,
  colorMode = 'colored'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const [mapConfig, setMapConfig] = useState({
    showStateLabels: showStateLabels,
    showValues: true,
    showRegions: true,
    colorMode: colorMode,
    valueSize: 'medium',
    borderWidth: 1
  });
  
  // Altura do mapa baseada em ser fullscreen ou não
  const mapHeight = fullscreen ? 'h-screen' : 'h-[500px]';
  
  // Buscar dados de expedição da API
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/expedicao/shipments/${period}`],
    queryFn: async () => {
      // Em caso de erro na API, retorna dados mockup
      // throw new Error("Simulando erro na API");
      return null;
    },
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Função para ajustar dados conforme o período (multiplica valores para demonstração)
  function adjustDataForPeriod(data: StateData[]): StateData[] {
    const multiplier = 
      period === 'daily' ? 1 :
      period === 'weekly' ? 5 :
      period === 'monthly' ? 20 :
      period === 'yearly' ? 200 : 1;
    
    return data.map(state => ({
      ...state,
      value: Math.round(state.value * multiplier * (0.8 + Math.random() * 0.4))
    }));
  }
  
  // Usar dados mockup ajustados pelo período
  const mockData = adjustDataForPeriod(getMockData());
  
  // Dados que serão exibidos no mapa (da API ou mockup)
  const stateData = data || mockData;
  
  // Encontrar o valor máximo para escala de cores
  const maxValue = Math.max(...stateData.map((state: StateData) => state.value), 1);
  
  // Função para obter cor do estado com base no valor e modo de cor
  function getColorForState(stateId: string): string {
    const state = stateData.find(s => s.id === stateId);
    
    if (!state) return "#f1f1f1"; // Cor padrão
    
    if (mapConfig.colorMode === 'outline') {
      return 'rgba(255, 255, 255, 0.7)'; // Fundo branco sólido no modo de contorno
    }
    
    // Normalizar o valor entre 0 e 1
    const normalizedValue = state.value / maxValue;
    
    if (mapConfig.colorMode === 'grayscale') {
      // Usar escala de cinza
      const colorIndex = Math.min(
        Math.floor(normalizedValue * GRAYSCALE_PALETTE.length),
        GRAYSCALE_PALETTE.length - 1
      );
      return GRAYSCALE_PALETTE[GRAYSCALE_PALETTE.length - 1 - colorIndex];
    } else {
      // Usar cor da região com opacidade baseada no valor
      const regionColor = STATE_COLORS_BY_REGION[stateId] || "#4285F4";
      
      // Quanto maior o valor, mais intenso é a cor
      const opacity = 0.2 + (normalizedValue * 0.8);
      
      // Função para ajustar a cor em hex com opacidade
      const adjustColorOpacity = (color: string, opacity: number) => {
        if (color.startsWith("#")) {
          // Converter HEX para RGB
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          
          // Misturar com branco baseado na opacidade
          const mixR = Math.round(r * opacity + 255 * (1 - opacity));
          const mixG = Math.round(g * opacity + 255 * (1 - opacity));
          const mixB = Math.round(b * opacity + 255 * (1 - opacity));
          
          return `#${mixR.toString(16).padStart(2, '0')}${mixG.toString(16).padStart(2, '0')}${mixB.toString(16).padStart(2, '0')}`;
        }
        return color;
      };
      
      return adjustColorOpacity(regionColor, opacity);
    }
  }
  
  // Função para determinar tamanho da fonte do valor
  function getValueFontSize(): number {
    switch(mapConfig.valueSize) {
      case 'small': return 11;
      case 'large': return 16;
      default: return 14;
    }
  }
  
  // Função para determinar cor do texto do valor
  function getValueTextColor(stateId: string): string {
    const state = stateData.find(s => s.id === stateId);
    if (!state) return "#333";
    
    if (mapConfig.colorMode === 'outline') {
      return "#333";
    }
    
    // Normalizar o valor entre 0 e 1
    const normalizedValue = state.value / maxValue;
    
    // Se o valor for alto (mais escuro), usar texto branco
    return normalizedValue > 0.5 ? "#fff" : "#333";
  }
  
  // Calcular total de envios
  const totalEnvios = stateData.reduce((acc, state: StateData) => acc + state.value, 0);
  
  // Calcular envios por região
  const enviosPorRegiao = {
    norte: stateData.filter(s => ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'].includes(s.id)).reduce((acc, s) => acc + s.value, 0),
    nordeste: stateData.filter(s => ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'].includes(s.id)).reduce((acc, s) => acc + s.value, 0),
    centro_oeste: stateData.filter(s => ['DF', 'GO', 'MT', 'MS'].includes(s.id)).reduce((acc, s) => acc + s.value, 0),
    sudeste: stateData.filter(s => ['ES', 'MG', 'RJ', 'SP'].includes(s.id)).reduce((acc, s) => acc + s.value, 0),
    sul: stateData.filter(s => ['PR', 'RS', 'SC'].includes(s.id)).reduce((acc, s) => acc + s.value, 0)
  };
  
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
              <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-xl rounded-lg p-4 text-sm z-50">
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
                
                <div className="mb-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={mapConfig.showRegions} 
                      onChange={e => setMapConfig({...mapConfig, showRegions: e.target.checked})}
                      className="rounded"
                    />
                    Mostrar indicadores regionais
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
          {/* Implementação usando imagem de fundo do mapa do Brasil */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Imagem do mapa somente em modos que não sejam de contorno */}
            {mapConfig.colorMode !== 'outline' ? (
              <img 
                src="/mapa-brasil-base.jpg" 
                alt="Mapa do Brasil" 
                className="max-h-full max-w-full object-contain absolute z-10 opacity-80"
              />
            ) : (
              <div className="absolute inset-0 z-10 bg-white"></div>
            )}
            <svg 
              viewBox="0 0 800 800" 
              preserveAspectRatio="xMidYMid meet"
              width="100%" 
              height="100%" 
              className="max-w-full absolute inset-0 z-20"
            >
              {/* Indicadores de região com percentuais */}
              {mapConfig.showRegions && (
                <g className="region-indicators">
                  {/* Norte */}
                  <g transform="translate(300, 180)">
                    <circle cx="0" cy="0" r="35" fill="#0c4a6e" fillOpacity="0.2" stroke="#0c4a6e" strokeWidth="1" />
                    <text x="0" y="-7" textAnchor="middle" fill="#0c4a6e" fontSize="14" fontWeight="bold">Norte</text>
                    <text x="0" y="12" textAnchor="middle" fill="#0c4a6e" fontSize="13">
                      {((enviosPorRegiao.norte / totalEnvios) * 100).toFixed(1)}%
                    </text>
                  </g>
                  
                  {/* Nordeste */}
                  <g transform="translate(550, 225)">
                    <circle cx="0" cy="0" r="35" fill="#9f1239" fillOpacity="0.2" stroke="#9f1239" strokeWidth="1" />
                    <text x="0" y="-7" textAnchor="middle" fill="#9f1239" fontSize="14" fontWeight="bold">Nordeste</text>
                    <text x="0" y="12" textAnchor="middle" fill="#9f1239" fontSize="13">
                      {((enviosPorRegiao.nordeste / totalEnvios) * 100).toFixed(1)}%
                    </text>
                  </g>
                  
                  {/* Centro-Oeste */}
                  <g transform="translate(365, 365)">
                    <circle cx="0" cy="0" r="35" fill="#3f6212" fillOpacity="0.2" stroke="#3f6212" strokeWidth="1" />
                    <text x="0" y="-7" textAnchor="middle" fill="#3f6212" fontSize="14" fontWeight="bold">Centro</text>
                    <text x="0" y="12" textAnchor="middle" fill="#3f6212" fontSize="13">
                      {((enviosPorRegiao.centro_oeste / totalEnvios) * 100).toFixed(1)}%
                    </text>
                  </g>
                  
                  {/* Sudeste */}
                  <g transform="translate(480, 465)">
                    <circle cx="0" cy="0" r="35" fill="#7e22ce" fillOpacity="0.2" stroke="#7e22ce" strokeWidth="1" />
                    <text x="0" y="-7" textAnchor="middle" fill="#7e22ce" fontSize="14" fontWeight="bold">Sudeste</text>
                    <text x="0" y="12" textAnchor="middle" fill="#7e22ce" fontSize="13">
                      {((enviosPorRegiao.sudeste / totalEnvios) * 100).toFixed(1)}%
                    </text>
                  </g>
                  
                  {/* Sul */}
                  <g transform="translate(400, 575)">
                    <circle cx="0" cy="0" r="35" fill="#0e7490" fillOpacity="0.2" stroke="#0e7490" strokeWidth="1" />
                    <text x="0" y="-7" textAnchor="middle" fill="#0e7490" fontSize="14" fontWeight="bold">Sul</text>
                    <text x="0" y="12" textAnchor="middle" fill="#0e7490" fontSize="13">
                      {((enviosPorRegiao.sul / totalEnvios) * 100).toFixed(1)}%
                    </text>
                  </g>
                </g>
              )}
              
              {/* Sobreposição de dados nos estados */}
              {BRAZILIAN_STATES.map((state: {id: string, name: string}) => {
                // Encontrar dados para este estado
                const stateInfo = stateData.find(s => s.id === state.id);
                const value = stateInfo?.value || 0;
                
                // Coordenadas para o texto de valor
                const x = STATE_CENTERS[state.id].x;
                const y = STATE_CENTERS[state.id].y;
                
                // Determinar raio do círculo com base no valor
                const radius = Math.max(20, Math.min(40, 20 + (value / 40)));
                
                return (
                  <g key={state.id}>
                    {/* Círculo com cor de fundo para o valor */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={getColorForState(state.id)}
                      stroke={mapConfig.colorMode === 'outline' ? "#333" : "#fff"}
                      strokeWidth={mapConfig.colorMode === 'outline' ? 2.5 : 2}
                      opacity={0.9}
                    />
                    
                    {/* Rótulos dos estados */}
                    {mapConfig.showStateLabels && (
                      <text 
                        x={x} 
                        y={y - radius - 5}
                        fontSize="12" 
                        fontWeight="bold"
                        textAnchor="middle" 
                        fill="#333"
                        pointerEvents="none"
                        stroke="#fff"
                        strokeWidth={0.5}
                        paintOrder="stroke"
                      >
                        {state.id}
                      </text>
                    )}
                    
                    {/* Valores dentro dos círculos */}
                    {mapConfig.showValues && (
                      <text 
                        x={x} 
                        y={y + 5}
                        fontSize={getValueFontSize()}
                        fontWeight="bold" 
                        textAnchor="middle" 
                        fill={mapConfig.colorMode === 'outline' ? "#000" : "#fff"}
                        pointerEvents="none"
                      >
                        {value}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Legenda do período */}
        <div className="absolute left-4 top-4 bg-white px-4 py-2 rounded-md shadow-lg z-30">
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
        
        {/* Legenda de cores e regiões */}
        <div className="absolute right-4 bottom-4 bg-white px-4 py-2 rounded-md shadow-lg max-w-xs z-30">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Volume de Envios</span>
              <button 
                onClick={() => {
                  // Alternar entre modos de cor
                  const modes: ('colored' | 'grayscale' | 'outline')[] = ['colored', 'grayscale', 'outline'];
                  const currentIndex = modes.indexOf(mapConfig.colorMode);
                  const nextIndex = (currentIndex + 1) % modes.length;
                  setMapConfig({...mapConfig, colorMode: modes[nextIndex]});
                }}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Mudar estilo
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-1">
              {[
                { label: 'Muito Alto', color: '#1e40af' },
                { label: 'Alto', color: '#2563eb' },
                { label: 'Médio', color: '#3b82f6' },
                { label: 'Baixo', color: '#60a5fa' },
                { label: 'Muito Baixo', color: '#93c5fd' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            
            {/* Distribuição por região */}
            <div className="border-t border-gray-200 pt-2 mt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Distribuição por Região</span>
                <button 
                  onClick={() => setMapConfig({...mapConfig, showRegions: !mapConfig.showRegions})}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {mapConfig.showRegions ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0c4a6e' }} />
                    <span>Norte</span>
                  </div>
                  <span>{((enviosPorRegiao.norte / totalEnvios) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9f1239' }} />
                    <span>Nordeste</span>
                  </div>
                  <span>{((enviosPorRegiao.nordeste / totalEnvios) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3f6212' }} />
                    <span>Centro-Oeste</span>
                  </div>
                  <span>{((enviosPorRegiao.centro_oeste / totalEnvios) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7e22ce' }} />
                    <span>Sudeste</span>
                  </div>
                  <span>{((enviosPorRegiao.sudeste / totalEnvios) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0e7490' }} />
                    <span>Sul</span>
                  </div>
                  <span>{((enviosPorRegiao.sul / totalEnvios) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BrasilTVMapNew;