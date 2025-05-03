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
      coordinates: [-30, 15]
    },
    destination: {
      city: 'Rio de Janeiro',
      state: 'RJ',
      coordinates: [15, 10]
    },
    steps: [
      {
        id: 1,
        type: 'pickup',
        location: {
          city: 'São Paulo',
          state: 'SP',
          coordinates: [-30, 15]
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
          coordinates: [-15, 13]
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
          coordinates: [0, 12]
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
          coordinates: [10, 10]
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
          coordinates: [15, 10]
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
              viewBox="-50 -30 100 60" 
              width="100%" 
              height="100%" 
              className="max-w-full max-h-full" 
              style={{ 
                filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))" 
              }}
            >
              {/* Mapa base do Brasil (SVG path simplificado) */}
              <path
                d="M-43,5 L-40,0 L-30,-5 L-25,-10 L-20,-15 L-15,-20 L-5,-20 L0,-15 L10,-20 L20,-15 L25,-5 L30,0 L25,10 L20,15 L15,20 L5,25 L0,20 L-5,15 L-15,10 L-25,10 L-35,5 L-43,5 Z"
                fill="#f0f9ff"
                stroke="#ccc"
                strokeWidth="0.5"
              />
              
              {/* Caminho do envio */}
              <path
                d={getPathPoints()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.8"
                strokeDasharray="1,1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Marcador de origem */}
              <circle
                cx={shipmentData.origin.coordinates[0]}
                cy={shipmentData.origin.coordinates[1]}
                r="1.5"
                fill="#22c55e"
                stroke="#fff"
                strokeWidth="0.3"
              />
              <text
                x={shipmentData.origin.coordinates[0]}
                y={shipmentData.origin.coordinates[1] - 2}
                textAnchor="middle"
                fontSize="2"
                fill="#333"
              >
                {shipmentData.origin.city}
              </text>
              
              {/* Marcador de destino */}
              <circle
                cx={shipmentData.destination.coordinates[0]}
                cy={shipmentData.destination.coordinates[1]}
                r="1.5"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="0.3"
              />
              <text
                x={shipmentData.destination.coordinates[0]}
                y={shipmentData.destination.coordinates[1] - 2}
                textAnchor="middle"
                fontSize="2"
                fill="#333"
              >
                {shipmentData.destination.city}
              </text>
              
              {/* Pontos de Etapas */}
              {steps.map((step, index) => (
                <g key={step.id}>
                  <circle
                    cx={step.location.coordinates[0]}
                    cy={step.location.coordinates[1]}
                    r={index <= currentStepIndex ? "1.2" : "0.8"}
                    fill={
                      index < currentStepIndex 
                        ? "#3b82f6" // Concluído (azul)
                        : index === currentStepIndex 
                          ? "#f59e0b" // Atual (laranja)
                          : "#d1d5db" // Futuro (cinza)
                    }
                    stroke="#fff"
                    strokeWidth="0.3"
                    opacity={index <= currentStepIndex ? 1 : 0.7}
                  />
                  
                  {/* Número da etapa */}
                  <text
                    x={step.location.coordinates[0]}
                    y={step.location.coordinates[1] + 0.3}
                    textAnchor="middle"
                    fontSize="1.2"
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
                    r="2"
                    fill="#f59e0b"
                    opacity="0.3"
                    stroke="none"
                  >
                    <animate
                      attributeName="r"
                      values="1;3;1"
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