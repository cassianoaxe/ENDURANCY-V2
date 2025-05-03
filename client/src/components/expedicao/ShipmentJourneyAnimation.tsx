import React, { useState, useEffect, useRef } from 'react';
import { Card, Heading } from '@/components/ui';
import { Loader2, Play, Pause, RotateCcw, TruckIcon, PackageIcon, HomeIcon, WarehouseIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface JourneyStep {
  id: number;
  type: 'pickup' | 'transit' | 'warehouse' | 'delivery';
  location: {
    city: string;
    state: string;
    coordinates: [number, number]; // [x, y] no SVG
  };
  timestamp: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
}

interface ShipmentData {
  id: number;
  tracking_code: string;
  origin: {
    city: string;
    state: string;
    coordinates: [number, number]; // [x, y] no SVG
  };
  destination: {
    city: string;
    state: string;
    coordinates: [number, number]; // [x, y] no SVG
  };
  steps: JourneyStep[];
  status: 'delivered' | 'in_transit' | 'pending';
  estimated_delivery: string;
}

interface ShipmentJourneyAnimationProps {
  shipmentId?: number;
  className?: string;
  fullscreen?: boolean;
}

const ShipmentJourneyAnimation: React.FC<ShipmentJourneyAnimationProps> = ({ 
  shipmentId, 
  className = '',
  fullscreen = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1 = normal speed
  
  // Busca dados da jornada do envio
  const { data: shipment, isLoading, error } = useQuery<ShipmentData>({
    queryKey: ['/api/expedicao/shipment-journey', shipmentId],
    enabled: !!shipmentId,
    refetchOnWindowFocus: false,
  });

  // Usar dados simulados para desenvolvimento se não houver dados reais
  const mockShipment: ShipmentData = {
    id: 1,
    tracking_code: 'BR564897654321',
    origin: {
      city: 'São Paulo',
      state: 'SP',
      coordinates: [350, 500] // Coordenadas ajustadas para o estado de SP
    },
    destination: {
      city: 'Rio de Janeiro',
      state: 'RJ',
      coordinates: [420, 460] // Coordenadas ajustadas para o estado do RJ
    },
    steps: [
      {
        id: 1,
        type: 'pickup',
        location: {
          city: 'São Paulo',
          state: 'SP',
          coordinates: [350, 500]
        },
        timestamp: '2025-05-01T08:30:00',
        description: 'Pacote coletado em São Paulo',
        status: 'completed'
      },
      {
        id: 2,
        type: 'transit',
        location: {
          city: 'Em trânsito',
          state: 'SP',
          coordinates: [375, 480]
        },
        timestamp: '2025-05-01T14:20:00',
        description: 'Em trânsito para centro de distribuição',
        status: 'completed'
      },
      {
        id: 3,
        type: 'warehouse',
        location: {
          city: 'Resende',
          state: 'RJ',
          coordinates: [395, 470]
        },
        timestamp: '2025-05-02T07:15:00',
        description: 'Chegou ao centro de distribuição em Resende',
        status: 'in_progress'
      },
      {
        id: 4,
        type: 'transit',
        location: {
          city: 'Em trânsito',
          state: 'RJ',
          coordinates: [410, 465]
        },
        timestamp: '2025-05-02T16:45:00',
        description: 'Em trânsito para o destino final',
        status: 'upcoming'
      },
      {
        id: 5,
        type: 'delivery',
        location: {
          city: 'Rio de Janeiro',
          state: 'RJ',
          coordinates: [420, 460]
        },
        timestamp: '2025-05-03T10:00:00',
        description: 'Entrega prevista no Rio de Janeiro',
        status: 'upcoming'
      }
    ],
    status: 'in_transit',
    estimated_delivery: '2025-05-03T10:00:00'
  };

  const shipmentData = shipment || mockShipment;
  const steps = shipmentData.steps;
  
  // Controle de animação
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      animationRef.current = window.requestAnimationFrame(() => {
        // Avançar lentamente pelo caminho
        const nextStepInterval = 2000 / animationSpeed; // 2 segundos por etapa, ajustado pela velocidade
        
        setTimeout(() => {
          setCurrentStepIndex(prevIndex => {
            if (prevIndex >= steps.length - 1) {
              setIsPlaying(false);
              return steps.length - 1;
            }
            return prevIndex + 1;
          });
        }, nextStepInterval);
      });
    }
    
    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps, animationSpeed]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnimationSpeed(parseFloat(e.target.value));
  };
  
  // Calcular o caminho da linha que conecta os pontos
  const getPathPoints = () => {
    if (steps.length < 2) return '';
    
    // Calcular apenas até a etapa atual para animação progressiva
    const activeSteps = steps.slice(0, currentStepIndex + 1);
    
    return activeSteps.map((step, index) => {
      const [x, y] = step.location.coordinates;
      return index === 0 ? `M${x},${y}` : `L${x},${y}`;
    }).join(' ');
  };
  
  // Componente de ícone baseado no tipo de etapa
  const StepIcon = ({ type }: { type: JourneyStep['type'] }) => {
    switch (type) {
      case 'pickup':
        return <PackageIcon className="h-4 w-4" />;
      case 'transit':
        return <TruckIcon className="h-4 w-4" />;
      case 'warehouse':
        return <WarehouseIcon className="h-4 w-4" />;
      case 'delivery':
        return <HomeIcon className="h-4 w-4" />;
      default:
        return <PackageIcon className="h-4 w-4" />;
    }
  };
  
  // Altura adequada baseada no modo
  const mapHeight = fullscreen ? "h-[calc(100vh-200px)]" : "h-[500px]";
  
  // Renderizar indicador de carregamento
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <Card className={`shadow-md overflow-hidden ${fullscreen ? 'border-2 border-primary/20' : ''}`}>
          <div className={`${mapHeight} bg-white relative flex items-center justify-center p-4`}>
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando dados da jornada...</p>
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
                Não foi possível carregar os dados da jornada deste envio. 
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  const currentStep = steps[currentStepIndex];
  
  return (
    <div className={`w-full ${className}`}>
      <Card className={`shadow-md overflow-hidden ${fullscreen ? 'border-2 border-primary/20' : ''}`}>
        <div className="p-4 bg-white">
          <Heading as="h2" size="lg" weight="semibold" className="mb-4 text-center">
            Jornada do Envio - {shipmentData.tracking_code}
          </Heading>
        </div>
        
        <div className={`${mapHeight} bg-white relative flex flex-col items-center justify-between p-4`}>
          {/* Área superior com mapa e animação */}
          <div className="w-full h-3/4 relative bg-sky-50 rounded-lg border border-sky-100 overflow-hidden">
            {/* SVG para o mapa e animação */}
            <svg 
              viewBox="0 0 600 700" 
              width="100%" 
              height="100%" 
              className="max-w-full max-h-full" 
              style={{ 
                filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))" 
              }}
            >
              {/* Importando o mapa detalhado do Brasil */}
              <g transform="scale(0.5) translate(-150, -250)">
                {/* Estado: AC - Acre */}
                <path d="M21,379 L50,365 L57,375 L73,370 L98,345 L95,334 L64,341 L40,341 L15,352 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: AM - Amazonas */}
                <path d="M95,334 L98,345 L127,329 L142,345 L175,356 L190,348 L220,334 L242,288 L225,269 L235,252 L218,240 L156,258 L150,230 L135,218 L118,231 L100,230 L84,250 L95,264 L75,280 L64,291 L75,313 L64,341 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: RR - Roraima */}
                <path d="M150,230 L156,258 L218,240 L235,198 L230,185 L200,185 L182,212 L164,210 L150,180 L135,218 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: AP - Amapá */}
                <path d="M266,202 L258,180 L240,170 L228,153 L206,153 L220,175 L230,185 L235,198 L245,205 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: PA - Pará */}
                <path d="M220,334 L242,288 L225,269 L235,252 L218,240 L235,198 L245,205 L266,202 L277,218 L298,208 L310,240 L335,240 L350,262 L330,287 L338,310 L320,333 L290,350 L265,345 L240,365 L230,353 L220,380 L190,348 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: MA - Maranhão */}
                <path d="M350,262 L335,240 L345,232 L380,232 L395,255 L405,265 L395,280 L410,290 L400,310 L375,300 L330,287 L338,310 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: TO - Tocantins */}
                <path d="M330,287 L338,310 L320,333 L290,350 L295,365 L305,380 L325,390 L335,380 L350,395 L375,385 L358,360 L365,345 L348,330 L358,315 L375,300 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: RO - Rondônia */}
                <path d="M175,356 L190,348 L220,380 L230,390 L242,410 L225,435 L195,425 L180,395 L142,345 L127,329 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: MT - Mato Grosso */}
                <path d="M220,380 L230,390 L242,410 L225,435 L240,450 L257,462 L265,435 L290,430 L305,440 L335,430 L340,410 L325,390 L305,380 L295,365 L290,350 L265,345 L240,365 L230,353 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: MS - Mato Grosso do Sul */}
                <path d="M257,462 L265,435 L290,430 L305,440 L315,470 L305,490 L280,498 L272,530 L250,525 L240,505 L225,498 L235,475 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: GO - Goiás */}
                <path d="M305,440 L335,430 L340,410 L325,390 L335,380 L350,395 L375,385 L392,397 L375,425 L380,440 L365,455 L345,455 L330,480 L315,470 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: DF - Distrito Federal */}
                <path d="M358,432 L365,426 L375,425 L374,435 L365,442 L358,438 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: BA - Bahia */}
                <path d="M400,350 L410,340 L430,355 L445,340 L465,345 L475,330 L465,305 L425,320 L410,290 L400,310 L375,300 L358,315 L348,330 L365,345 L358,360 L375,385 L392,397 L375,425 L380,440 L390,455 L410,455 L425,430 L435,408 L425,390 L430,375 L415,365 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: PI - Piauí */}
                <path d="M400,310 L410,290 L395,280 L405,265 L410,240 L425,215 L435,240 L450,250 L452,275 L430,305 L425,320 L410,340 L400,350 L415,365 L430,375 L425,390 L405,392 L385,370 L378,350 L390,340 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: CE - Ceará */}
                <path d="M435,240 L455,230 L465,210 L485,205 L495,230 L475,255 L480,280 L450,270 L452,275 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: PE - Pernambuco */}
                <path d="M445,340 L465,345 L475,330 L495,325 L515,310 L535,310 L545,328 L520,335 L500,348 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: AL - Alagoas */}
                <path d="M515,310 L535,310 L545,328 L555,332 L545,345 L530,345 L520,335 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: SE - Sergipe */}
                <path d="M500,348 L520,335 L530,345 L525,355 L507,353 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: RN - Rio Grande do Norte */}
                <path d="M475,255 L480,280 L500,290 L525,280 L530,265 L505,260 L495,230 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: PB - Paraíba */}
                <path d="M480,280 L500,290 L525,280 L535,295 L515,310 L495,325 L475,330 L465,305 L450,270 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: SP - São Paulo */}
                <path d="M330,480 L345,455 L365,455 L370,475 L385,470 L400,485 L385,510 L370,520 L350,512 L330,530 L310,530 L305,490 L315,470 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: MG - Minas Gerais */}
                <path d="M365,455 L380,440 L390,455 L410,455 L425,430 L435,408 L425,390 L445,380 L470,400 L472,425 L440,445 L425,475 L400,485 L385,470 L370,475 L365,455 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: ES - Espírito Santo */}
                <path d="M445,380 L470,400 L472,425 L490,420 L495,400 L475,375 L455,375 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: RJ - Rio de Janeiro */}
                <path d="M400,485 L425,475 L440,445 L472,425 L490,420 L415,445 L405,475 L390,480 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: PR - Paraná */}
                <path d="M305,490 L310,530 L330,530 L350,512 L370,520 L385,510 L325,555 L290,555 L280,535 L280,498 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: SC - Santa Catarina */}
                <path d="M280,535 L290,555 L325,555 L320,570 L295,595 L275,575 L272,530 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                
                {/* Estado: RS - Rio Grande do Sul */}
                <path d="M272,530 L275,575 L295,595 L325,625 L265,650 L225,630 L240,575 L250,525 Z" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
              </g>
              
              {/* Caminho do envio */}
              <path
                d={getPathPoints()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="6,3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Marcador de origem */}
              <circle
                cx={shipmentData.origin.coordinates[0]}
                cy={shipmentData.origin.coordinates[1]}
                r="8"
                fill="#22c55e"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={shipmentData.origin.coordinates[0]}
                y={shipmentData.origin.coordinates[1] - 15}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                fontWeight="bold"
              >
                {shipmentData.origin.city}
              </text>
              
              {/* Marcador de destino */}
              <circle
                cx={shipmentData.destination.coordinates[0]}
                cy={shipmentData.destination.coordinates[1]}
                r="8"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={shipmentData.destination.coordinates[0]}
                y={shipmentData.destination.coordinates[1] - 15}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                fontWeight="bold"
              >
                {shipmentData.destination.city}
              </text>
              
              {/* Pontos de Etapas */}
              {steps.map((step, index) => (
                <g key={step.id}>
                  <circle
                    cx={step.location.coordinates[0]}
                    cy={step.location.coordinates[1]}
                    r={index <= currentStepIndex ? "7" : "5"}
                    fill={
                      index < currentStepIndex 
                        ? "#3b82f6" // Concluído (azul)
                        : index === currentStepIndex 
                          ? "#f59e0b" // Atual (laranja)
                          : "#d1d5db" // Futuro (cinza)
                    }
                    stroke="#fff"
                    strokeWidth="2"
                    opacity={index <= currentStepIndex ? 1 : 0.7}
                  />
                  
                  {/* Número da etapa */}
                  <text
                    x={step.location.coordinates[0]}
                    y={step.location.coordinates[1] + 2}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#fff"
                    fontWeight="bold"
                  >
                    {index + 1}
                  </text>
                </g>
              ))}
              
              {/* Ícone animado da posição atual */}
              {currentStep && (
                <g>
                  <circle
                    cx={currentStep.location.coordinates[0]}
                    cy={currentStep.location.coordinates[1]}
                    r="12"
                    fill="#f59e0b"
                    opacity="0.3"
                    stroke="none"
                  >
                    <animate
                      attributeName="r"
                      values="8;18;8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.7;0.2;0.7"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )}
            </svg>
            
            {/* Legenda do mapa */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 py-1 px-3 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <span>Origem</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                <span>Trânsito</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                <span>Destino</span>
              </div>
            </div>
          </div>
          
          {/* Área inferior com controles e informações */}
          <div className="w-full h-1/4 mt-4 flex flex-col">
            {/* Controles de reprodução */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={handleReset}
                aria-label="Reiniciar animação"
              >
                <RotateCcw className="h-5 w-5 text-gray-600" />
              </button>
              
              <button 
                className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                onClick={handlePlayPause}
                aria-label={isPlaying ? "Pausar animação" : "Iniciar animação"}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-primary" />
                ) : (
                  <Play className="h-6 w-6 text-primary" />
                )}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Velocidade:</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={animationSpeed}
                  onChange={handleSpeedChange}
                  className="w-24"
                />
                <span className="text-xs text-gray-500">{animationSpeed}x</span>
              </div>
            </div>
            
            {/* Informações da etapa atual */}
            {currentStep && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <StepIcon type={currentStep.type} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {currentStep.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentStep.location.city}, {currentStep.location.state} - {new Date(currentStep.timestamp).toLocaleString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                    ${currentStep.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    currentStep.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}
                  >
                    {currentStep.status === 'completed' ? 'Concluído' : 
                     currentStep.status === 'in_progress' ? 'Em andamento' : 
                     'Aguardando'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Etapa {currentStepIndex + 1} de {steps.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ShipmentJourneyAnimation;