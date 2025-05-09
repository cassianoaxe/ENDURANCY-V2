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
    
    // Paleta de cores exatamente como na imagem de referência
    // Retorna a cor fixa do estado conforme a imagem e a sobrepõe com opacidade baseada no valor
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
    
    // Se quisermos aplicar uma escala de opacidade ao valor, podemos usar algo como:
    const baseColor = stateFixedColors[stateId] || "#e0e0e0";
    const opacity = Math.max(0.4, Math.min(1, stateInfo.value / maxValue * 0.5 + 0.5));
    
    // Para efeito visual, aplica transparência sutil para diferenciar estados com mais ou menos envios
    // Mas mantém as cores base conforme a imagem de referência
    if (stateInfo.value === 0) {
      // Estado sem envios: mais transparente
      return baseColor + "80"; // 50% opacity
    } else if (stateInfo.value < maxValue * 0.3) {
      // Poucos envios: levemente transparente
      return baseColor + "C0"; // 75% opacity
    } else {
      // Muitos envios: totalmente opaco
      return baseColor;
    }
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
            viewBox="0 0 800 800" 
            preserveAspectRatio="xMidYMid meet"
            width="100%" 
            height="100%" 
            className="max-w-full max-h-full" 
            style={{ 
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))" 
            }}
          >
            {/* Copiando exatamente o formato da imagem de referência */}
            
            {/* Roraima - azul escuro */}
            <path 
              d="M228,81 L198,90 L188,110 L205,138 L240,140 L274,120 L292,95 L270,81 Z" 
              fill={getColorForState('RR')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RR')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="228" y="115" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Roraima</text>

            {/* Amapá - verde */}
            <path 
              d="M352,65 L332,95 L345,135 L370,158 L398,140 L407,110 L397,85 L370,70 Z" 
              fill={getColorForState('AP')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AP')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="368" y="115" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Amapá</text>

            {/* Amazonas - amarelo */}
            <path 
              d="M102,167 L122,140 L177,128 L188,110 L198,90 L228,81 L270,81 L292,95 L274,120 L240,140 L205,138 L230,175 L290,185 L348,173 L348,208 L318,238 L265,258 L200,265 L155,242 L130,270 Z" 
              fill={getColorForState('AM')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AM')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="218" y="185" fontSize="18" textAnchor="middle" fill="#fff" pointerEvents="none">Amazonas</text>

            {/* Pará - azul */}
            <path 
              d="M348,173 L370,158 L398,140 L430,148 L465,175 L495,175 L520,198 L515,228 L478,265 L425,275 L395,295 L348,208 Z" 
              fill={getColorForState('PA')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PA')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="433" y="225" fontSize="18" textAnchor="middle" fill="#fff" pointerEvents="none">Pará</text>

            {/* Acre - verde */}
            <path 
              d="M50,268 L60,245 L102,235 L130,270 L100,285 Z" 
              fill={getColorForState('AC')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AC')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="90" y="260" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Acre</text>

            {/* Rondônia - azul */}
            <path 
              d="M130,270 L155,242 L200,265 L190,298 L155,325 L110,305 Z" 
              fill={getColorForState('RO')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RO')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="150" y="290" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Rondônia</text>

            {/* Mato Grosso - verde */}
            <path 
              d="M190,298 L200,265 L265,258 L318,238 L348,208 L395,295 L370,345 L370,375 L330,415 L270,395 L225,370 L190,360 Z" 
              fill={getColorForState('MT')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MT')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="280" y="345" fontSize="16" textAnchor="middle" fill="#fff" pointerEvents="none">Mato Grosso</text>

            {/* Tocantins - amarelo */}
            <path 
              d="M395,295 L425,275 L465,305 L450,348 L425,370 L395,372 L370,345 Z" 
              fill={getColorForState('TO')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('TO')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="420" y="335" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Tocantins</text>

            {/* Maranhão - verde */}
            <path 
              d="M478,265 L515,228 L560,210 L610,218 L615,245 L590,275 L550,282 L525,300 L465,305 L425,275 Z" 
              fill={getColorForState('MA')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MA')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="545" y="250" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Maranhão</text>

            {/* Piauí - azul */}
            <path 
              d="M525,300 L550,282 L590,275 L615,245 L625,262 L615,310 L583,332 L550,335 L525,340 L465,305 Z" 
              fill={getColorForState('PI')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PI')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="580" y="305" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Piauí</text>

            {/* Ceará - azul escuro */}
            <path 
              d="M615,245 L610,218 L655,208 L685,228 L680,265 L650,278 L625,262 Z" 
              fill={getColorForState('CE')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('CE')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="650" y="240" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Ceará</text>

            {/* Rio Grande do Norte - azul escuro */}
            <path 
              d="M685,228 L718,222 L740,240 L720,265 L685,265 L680,265 Z" 
              fill={getColorForState('RN')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RN')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="715" y="235" fontSize="11" textAnchor="middle" fill="#fff" pointerEvents="none">Rio Grande</text>
            <text x="715" y="248" fontSize="11" textAnchor="middle" fill="#fff" pointerEvents="none">do Norte</text>

            {/* Paraíba - azul */}
            <path 
              d="M680,265 L685,265 L720,265 L740,285 L705,298 L678,282 L650,278 Z" 
              fill={getColorForState('PB')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PB')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="700" y="280" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">Paraíba</text>

            {/* Pernambuco - amarelo */}
            <path 
              d="M650,278 L678,282 L705,298 L735,300 L715,325 L675,328 L645,318 L615,310 L625,262 Z" 
              fill={getColorForState('PE')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PE')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="680" y="310" fontSize="12" textAnchor="middle" fill="#fff" pointerEvents="none">Pernambuco</text>

            {/* Alagoas - azul */}
            <path 
              d="M715,325 L735,300 L760,310 L740,335 Z" 
              fill={getColorForState('AL')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('AL')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="735" y="320" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">Alagoas</text>

            {/* Sergipe - azul escuro */}
            <path 
              d="M740,335 L760,310 L775,325 L760,345 Z" 
              fill={getColorForState('SE')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('SE')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="760" y="330" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">Sergipe</text>

            {/* Bahia - verde */}
            <path 
              d="M465,305 L525,340 L550,335 L583,332 L615,310 L645,318 L675,328 L715,325 L740,335 L760,345 L730,385 L690,405 L645,415 L605,415 L575,435 L535,425 L500,435 L465,405 L450,370 L465,350 L450,348 Z" 
              fill={getColorForState('BA')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('BA')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="600" y="375" fontSize="18" textAnchor="middle" fill="#fff" pointerEvents="none">Bahia</text>

            {/* Goiás - azul escuro */}
            <path 
              d="M370,345 L395,372 L425,370 L450,370 L465,405 L415,428 L388,442 L360,435 L330,415 L370,375 Z" 
              fill={getColorForState('GO')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('GO')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="405" y="410" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Goiás</text>

            {/* Distrito Federal - pequeno ponto ao lado de Goiás */}
            <path 
              d="M415,428 L423,423 L430,430 L422,435 Z" 
              fill={getColorForState('DF')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('DF')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="445" y="433" fontSize="7" textAnchor="middle" fill="#000" pointerEvents="none">Brasília (D.F)</text>
            <line x1="430" y1="433" x2="465" y2="435" stroke="#f00" strokeWidth="1" />

            {/* Mato Grosso do Sul - amarelo */}
            <path 
              d="M270,395 L330,415 L360,435 L330,480 L282,480 L245,460 L240,430 Z" 
              fill={getColorForState('MS')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MS')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="305" y="445" fontSize="12" textAnchor="middle" fill="#000" pointerEvents="none">Mato Grosso</text>
            <text x="305" y="460" fontSize="12" textAnchor="middle" fill="#000" pointerEvents="none">do Sul</text>

            {/* Minas Gerais - azul */}
            <path 
              d="M360,435 L388,442 L415,428 L465,405 L500,435 L535,425 L545,465 L515,495 L465,505 L412,510 L380,498 L360,480 L330,480 Z" 
              fill={getColorForState('MG')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('MG')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="450" y="465" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Minas Gerais</text>

            {/* Espírito Santo - azul escuro */}
            <path 
              d="M535,425 L575,435 L585,445 L570,485 L545,465 Z" 
              fill={getColorForState('ES')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('ES')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="565" y="455" fontSize="9" textAnchor="middle" fill="#fff" pointerEvents="none">Espírito</text>
            <text x="565" y="465" fontSize="9" textAnchor="middle" fill="#fff" pointerEvents="none">Santo</text>

            {/* Rio de Janeiro - amarelo */}
            <path 
              d="M515,495 L545,465 L570,485 L555,502 L535,515 L505,505 Z" 
              fill={getColorForState('RJ')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RJ')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="540" y="495" fontSize="10" textAnchor="middle" fill="#000" pointerEvents="none">Rio De</text>
            <text x="540" y="505" fontSize="10" textAnchor="middle" fill="#000" pointerEvents="none">Janeiro</text>

            {/* São Paulo - azul escuro */}
            <path 
              d="M330,480 L360,480 L380,498 L412,510 L395,535 L360,545 L330,530 L305,520 Z" 
              fill={getColorForState('SP')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('SP')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="370" y="515" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">São Paulo</text>

            {/* Paraná - verde */}
            <path 
              d="M260,525 L305,520 L330,530 L345,557 L322,565 L292,560 L270,540 Z" 
              fill={getColorForState('PR')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('PR')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="310" y="545" fontSize="14" textAnchor="middle" fill="#fff" pointerEvents="none">Paraná</text>

            {/* Santa Catarina - azul escuro */}
            <path 
              d="M270,540 L292,560 L322,565 L310,585 L285,580 L260,575 Z" 
              fill={getColorForState('SC')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('SC')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="292" y="572" fontSize="10" textAnchor="middle" fill="#fff" pointerEvents="none">Santa Catarina</text>

            {/* Rio Grande do Sul - amarelo */}
            <path 
              d="M225,580 L260,575 L285,580 L310,585 L322,600 L315,620 L275,640 L235,638 L215,625 L200,605 Z" 
              fill={getColorForState('RS')} 
              stroke="#fff" 
              strokeWidth="2"
              onMouseEnter={() => handleStateHover('RS')}
              onMouseLeave={handleStateLeave}
              style={{ cursor: 'pointer' }}
            />
            <text x="270" y="615" fontSize="12" textAnchor="middle" fill="#000" pointerEvents="none">Rio Grande</text>
            <text x="270" y="630" fontSize="12" textAnchor="middle" fill="#000" pointerEvents="none">do Sul</text>

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
          
          {/* Legenda da escala de cores baseada na imagem de referência */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 py-2 px-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#FFD700] mr-2"></div>
              <span className="text-xs text-gray-600">Baixo</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#3CB371] mr-2"></div>
              <span className="text-xs text-gray-600">Médio</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#4682B4] mr-2"></div>
              <span className="text-xs text-gray-600">Médio-Alto</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#191970] mr-2"></div>
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