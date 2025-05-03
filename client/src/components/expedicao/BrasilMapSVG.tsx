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

// Dados padrão para o mapa (serão substituídos por dados do servidor)
const DEFAULT_DATA: StateData[] = BRAZILIAN_STATES.map(state => ({
  id: state.id,
  name: state.name,
  value: 0
}));

const BrasilMapSVG: React.FC<BrasilMapProps> = ({ 
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
  const maxValue = stateData ? Math.max(...stateData.map(state => state.value), 1) : 1;
  
  // Altura adequada baseada no modo
  const mapHeight = fullscreen ? "h-[calc(100vh-250px)]" : "h-[500px]";
  
  // Função para gerar cor baseada no valor
  const getColorForState = (stateId: string) => {
    if (!stateData) return "#e0e0e0"; // cor para quando não há dados
    
    const stateInfo = stateData.find(state => state.id === stateId);
    if (!stateInfo) return "#e0e0e0"; // cor para estados sem dados
    
    if (maxValue === 0) return "#e0e0e0"; // Evitar divisão por zero
    
    // Paleta de cores baseada na imagem de referência
    const colors = [
      '#FFD700', // Amarelo (baixa quantidade)
      '#3CB371', // Verde (média quantidade)
      '#4682B4', // Azul (média-alta quantidade)
      '#191970'  // Azul escuro (alta quantidade)
    ];
    
    const ratio = stateInfo.value / maxValue;
    if (ratio < 0.25) return colors[0];
    if (ratio < 0.5) return colors[1];
    if (ratio < 0.75) return colors[2];
    return colors[3];
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
          <svg 
            viewBox="0 0 800 600" 
            preserveAspectRatio="xMidYMid meet"
            width="100%" 
            height="100%" 
            className="max-w-full max-h-full" 
            style={{ 
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))" 
            }}
          >
            {/* Renderizando os estados baseados na imagem fornecida */}
            <path 
              d="M150,100 L200,80 L250,100 L300,80 L350,120 L280,170 L220,160 Z" 
              fill={getColorForState('RR')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RR')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="200" y="130" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Roraima</text>

            <path 
              d="M350,120 L400,100 L450,150 L400,200 L350,180 Z" 
              fill={getColorForState('AP')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AP')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="380" y="150" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Amapá</text>

            <path 
              d="M150,100 L280,170 L350,180 L400,200 L350,250 L280,260 L200,240 L150,200 Z" 
              fill={getColorForState('AM')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AM')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="250" y="190" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Amazonas</text>

            <path 
              d="M400,200 L450,150 L500,180 L550,200 L520,250 L480,280 L400,300 L350,250 Z" 
              fill={getColorForState('PA')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PA')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="450" y="240" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Pará</text>

            <path 
              d="M150,200 L200,240 L180,280 L130,270 Z" 
              fill={getColorForState('AC')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AC')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="160" y="250" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Acre</text>

            <path 
              d="M180,280 L200,240 L280,260 L250,330 L200,320 Z" 
              fill={getColorForState('RO')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RO')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="230" y="290" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Rondônia</text>

            <path 
              d="M250,330 L280,260 L350,250 L400,300 L380,380 L320,410 L250,380 Z" 
              fill={getColorForState('MT')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MT')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="320" y="340" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Mato Grosso</text>

            <path 
              d="M400,300 L480,280 L520,300 L500,350 L450,380 L420,360 L380,380 Z" 
              fill={getColorForState('TO')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('TO')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="440" y="330" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Tocantins</text>

            <path 
              d="M520,250 L550,200 L600,180 L650,200 L630,250 L590,280 L520,300 Z" 
              fill={getColorForState('MA')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MA')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="580" y="240" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Maranhão</text>

            <path 
              d="M520,300 L590,280 L630,250 L650,280 L630,320 L590,350 L550,340 L500,350 Z" 
              fill={getColorForState('PI')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PI')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="580" y="310" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Piauí</text>

            <path 
              d="M650,200 L700,180 L720,200 L700,240 L650,280 L630,250 Z" 
              fill={getColorForState('CE')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('CE')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="680" y="230" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Ceará</text>

            <path 
              d="M700,240 L720,200 L750,210 L730,250 Z" 
              fill={getColorForState('RN')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RN')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="730" y="230" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">RN</text>

            <path 
              d="M700,240 L730,250 L750,270 L700,290 L670,270 L650,280 Z" 
              fill={getColorForState('PB')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PB')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="710" y="260" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">PB</text>

            <path 
              d="M670,270 L700,290 L750,270 L760,290 L700,320 L650,310 Z" 
              fill={getColorForState('PE')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PE')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="700" y="300" fontSize="11" textAnchor="middle" fill="#fff" pointerEvents="none">Pernambuco</text>

            <path 
              d="M700,320 L760,290 L780,310 L740,340 Z" 
              fill={getColorForState('AL')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AL')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="740" y="320" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">AL</text>

            <path 
              d="M740,340 L780,310 L800,330 L760,350 Z" 
              fill={getColorForState('SE')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('SE')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="770" y="330" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">SE</text>

            <path 
              d="M500,350 L550,340 L590,350 L630,320 L650,310 L650,280 Z" 
              fill={getColorForState('BA')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('BA')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="550" y="370" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Bahia</text>

            <path 
              d="M380,380 L420,360 L450,380 L430,420 L380,450 L320,410 Z" 
              fill={getColorForState('GO')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('GO')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="400" y="410" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Goiás</text>

            <path 
              d="M430,420 L440,430 L420,440 L410,430 Z" 
              fill={getColorForState('DF')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('DF')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="425" y="435" fontSize="8" textAnchor="middle" fill="#fff" pointerEvents="none">DF</text>

            <path 
              d="M250,380 L320,410 L380,450 L350,500 L280,470 L240,430 Z" 
              fill={getColorForState('MS')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MS')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="310" y="440" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">MS</text>

            <path 
              d="M380,450 L430,420 L480,430 L520,420 L550,450 L500,500 L450,510 L380,490 L350,500 Z" 
              fill={getColorForState('MG')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MG')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="450" y="470" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Minas Gerais</text>

            <path 
              d="M550,450 L600,430 L620,450 L600,480 L550,470 L500,500 Z" 
              fill={getColorForState('ES')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('ES')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="580" y="460" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">ES</text>

            <path 
              d="M500,500 L550,470 L600,480 L580,520 L530,530 L500,520 Z" 
              fill={getColorForState('RJ')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RJ')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="550" y="510" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">RJ</text>

            <path 
              d="M350,500 L380,490 L450,510 L400,550 L350,540 L320,520 Z" 
              fill={getColorForState('SP')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('SP')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="380" y="520" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">São Paulo</text>

            <path 
              d="M280,470 L350,500 L320,520 L350,540 L320,560 L270,550 L250,520 Z" 
              fill={getColorForState('PR')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PR')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="300" y="530" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Paraná</text>

            <path 
              d="M270,550 L320,560 L300,580 L250,570 Z" 
              fill={getColorForState('SC')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('SC')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="290" y="570" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">SC</text>

            <path 
              d="M250,570 L300,580 L320,600 L270,620 L220,600 L200,580 Z" 
              fill={getColorForState('RS')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RS')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="260" y="600" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Rio Grande do Sul</text>

            {/* Tooltip para o estado com hover */}
            {hoveredState && hoveredStateData && (
              <foreignObject
                x="0"
                y="0"
                width="800"
                height="600"
                style={{ 
                  overflow: 'visible', 
                  pointerEvents: 'none' 
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: getStatePosition(hoveredState).y + 'px',
                    left: getStatePosition(hoveredState).x + 'px',
                    transform: 'translate(-50%, -100%)',
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
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 py-2 px-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-300 mr-2"></div>
              <span className="text-xs text-gray-600">Baixo</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-600">Médio</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
              <span className="text-xs text-gray-600">Médio-Alto</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-900 mr-2"></div>
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
    'RR': { x: 200, y: 130 },
    'AP': { x: 380, y: 150 },
    'AM': { x: 250, y: 190 },
    'PA': { x: 450, y: 240 },
    'AC': { x: 160, y: 250 },
    'RO': { x: 230, y: 290 },
    'MT': { x: 320, y: 340 },
    'TO': { x: 440, y: 330 },
    'MA': { x: 580, y: 240 },
    'PI': { x: 580, y: 310 },
    'CE': { x: 680, y: 230 },
    'RN': { x: 730, y: 230 },
    'PB': { x: 710, y: 260 },
    'PE': { x: 700, y: 300 },
    'AL': { x: 740, y: 320 },
    'SE': { x: 770, y: 330 },
    'BA': { x: 550, y: 370 },
    'GO': { x: 400, y: 410 },
    'DF': { x: 425, y: 435 },
    'MS': { x: 310, y: 440 },
    'MG': { x: 450, y: 470 },
    'ES': { x: 580, y: 460 },
    'RJ': { x: 550, y: 510 },
    'SP': { x: 380, y: 520 },
    'PR': { x: 300, y: 530 },
    'SC': { x: 290, y: 570 },
    'RS': { x: 260, y: 600 }
  };
  
  return positions[stateId] || { x: 0, y: 0 };
};

export default BrasilMapSVG;