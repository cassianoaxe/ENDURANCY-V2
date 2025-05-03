import React, { useEffect, useState } from 'react';
import { Card, Heading } from '@/components/ui';
import { Loader2 } from 'lucide-react';

// Tipo para os dados de envios por estado
interface StateShipmentData {
  id: string; // Código do estado (SP, RJ, etc)
  name: string; // Nome do estado
  value: number; // Quantidade de envios
}

// Props do componente
interface SimpleBrasilMapProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  className?: string;
  fullscreen?: boolean;
}

// Componente para estado de carregamento
const LoadingDisplay = ({ height }: { height: string }) => (
  <div className={`w-full ${height} flex items-center justify-center`}>
    <div className="flex flex-col items-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-gray-600">Carregando mapa...</p>
    </div>
  </div>
);

// Componente para exibição de erro
const ErrorDisplay = ({ 
  error, 
  onRetry,
  height 
}: { 
  error: string;
  onRetry: () => void;
  height: string;
}) => (
  <div className={`w-full ${height} flex items-center justify-center`}>
    <div className="text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Tentar novamente
      </button>
    </div>
  </div>
);

// Mapa interativo simplificado do Brasil baseado em SVG
const SimpleBrasilMap: React.FC<SimpleBrasilMapProps> = ({ 
  period, 
  className = '',
  fullscreen = false 
}) => {
  const [data, setData] = useState<StateShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Altura adequada baseada no modo
  const mapHeight = fullscreen ? "h-[calc(100vh-240px)]" : "h-[500px]";
  
  // Carregamento de dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Dados mockados de envios por estado
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
          { id: "RO", name: "Rondônia", value: 55 },
          { id: "AP", name: "Amapá", value: 40 },
          { id: "AC", name: "Acre", value: 35 },
          { id: "RR", name: "Roraima", value: 25 }
        ];
        
        // Simulação de atraso para melhor experiência de UI
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setData(mockData);
      } catch (err: any) {
        console.error('Erro ao carregar dados de expedição:', err);
        setError(`Falha ao carregar dados: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [period]);
  
  // Handler para tentar novamente em caso de erro
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };
  
  // Encontra o valor máximo para calibrar a escala de cores
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 100;
  
  // Função para gerar a cor baseada no valor (escala de azul)
  const getColorForValue = (value: number) => {
    const normalizedValue = value / maxValue; // valor entre 0 e 1
    const intensity = Math.floor(255 - normalizedValue * 200); // mais intenso para valores maiores
    return `rgb(${intensity}, ${intensity}, 255)`;
  };
  
  // Função para lidar com hover em um estado
  const handleStateHover = (stateId: string) => {
    setSelectedState(stateId);
  };
  
  // Função para lidar com o fim do hover
  const handleStateLeave = () => {
    setSelectedState(null);
  };
  
  // Informações do estado selecionado
  const selectedStateData = selectedState ? data.find(state => state.id === selectedState) : null;

  if (loading) {
    return <LoadingDisplay height={mapHeight} />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} height={mapHeight} />;
  }

  return (
    <div className={`w-full ${className}`}>
      <Card className={`shadow-md overflow-hidden ${fullscreen ? 'border-2 border-primary/20' : ''}`}>
        <div className="p-4 bg-white">
          <Heading as="h2" size="lg" weight="semibold" className="mb-4 text-center">
            Distribuição de Envios por Estado
          </Heading>
        </div>
        
        <div className={`${mapHeight} relative bg-sky-50 flex justify-center items-center`}>
          {/* Mapa SVG simplificado do Brasil */}
          <div className="max-w-2xl w-full px-6">
            <svg 
              viewBox="0 0 800 800" 
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))' }}
            >
              {/* Grupos de estados por região */}
              <g id="norte">
                {/* Amazonas */}
                <path 
                  id="AM" 
                  d="M226,326 L200,250 L160,280 L120,260 L90,320 L130,350 L180,340 L240,370 Z" 
                  fill={getColorForValue(data.find(d => d.id === "AM")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("AM")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Pará */}
                <path 
                  id="PA" 
                  d="M240,370 L320,350 L400,370 L380,430 L330,450 L270,440 L260,390 Z" 
                  fill={getColorForValue(data.find(d => d.id === "PA")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("PA")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Rondônia */}
                <path 
                  id="RO" 
                  d="M180,340 L240,370 L260,390 L240,420 L200,430 L170,400 Z" 
                  fill={getColorForValue(data.find(d => d.id === "RO")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("RO")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Acre */}
                <path 
                  id="AC" 
                  d="M90,320 L130,350 L170,400 L130,410 L100,380 Z" 
                  fill={getColorForValue(data.find(d => d.id === "AC")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("AC")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Roraima */}
                <path 
                  id="RR" 
                  d="M200,250 L226,326 L200,280 L180,220 Z" 
                  fill={getColorForValue(data.find(d => d.id === "RR")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("RR")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Amapá */}
                <path 
                  id="AP" 
                  d="M320,260 L340,300 L320,350 L300,330 L290,290 Z" 
                  fill={getColorForValue(data.find(d => d.id === "AP")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("AP")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Tocantins */}
                <path 
                  id="TO" 
                  d="M380,430 L330,450 L340,480 L370,510 L400,480 Z" 
                  fill={getColorForValue(data.find(d => d.id === "TO")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("TO")}
                  onMouseLeave={handleStateLeave}
                />
              </g>
              
              <g id="nordeste">
                {/* Maranhão */}
                <path 
                  id="MA" 
                  d="M400,370 L440,360 L450,400 L420,430 L400,430 L380,430 Z" 
                  fill={getColorForValue(data.find(d => d.id === "MA")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("MA")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Piauí */}
                <path 
                  id="PI" 
                  d="M450,400 L460,380 L490,410 L480,450 L450,460 L420,430 Z" 
                  fill={getColorForValue(data.find(d => d.id === "PI")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("PI")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Ceará */}
                <path 
                  id="CE" 
                  d="M490,410 L520,390 L550,410 L530,450 L500,470 L480,450 Z" 
                  fill={getColorForValue(data.find(d => d.id === "CE")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("CE")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Rio Grande do Norte */}
                <path 
                  id="RN" 
                  d="M550,410 L580,400 L590,420 L570,440 L530,450 Z" 
                  fill={getColorForValue(data.find(d => d.id === "RN")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("RN")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Paraíba */}
                <path 
                  id="PB" 
                  d="M570,440 L590,420 L620,430 L610,460 L580,450 Z" 
                  fill={getColorForValue(data.find(d => d.id === "PB")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("PB")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Pernambuco */}
                <path 
                  id="PE" 
                  d="M500,470 L530,450 L570,440 L580,450 L570,480 L530,490 Z" 
                  fill={getColorForValue(data.find(d => d.id === "PE")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("PE")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Alagoas */}
                <path 
                  id="AL" 
                  d="M570,480 L610,460 L620,480 L590,510 L560,500 Z" 
                  fill={getColorForValue(data.find(d => d.id === "AL")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("AL")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Sergipe */}
                <path 
                  id="SE" 
                  d="M560,500 L590,510 L600,530 L570,540 L550,520 Z" 
                  fill={getColorForValue(data.find(d => d.id === "SE")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("SE")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Bahia */}
                <path 
                  id="BA" 
                  d="M450,460 L500,470 L530,490 L560,500 L550,520 L570,540 L520,590 L460,570 L400,530 L370,510 L450,460" 
                  fill={getColorForValue(data.find(d => d.id === "BA")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("BA")}
                  onMouseLeave={handleStateLeave}
                />
              </g>
              
              <g id="centro-oeste">
                {/* Mato Grosso */}
                <path 
                  id="MT" 
                  d="M240,420 L260,390 L270,440 L330,450 L340,480 L320,540 L250,490 L240,420" 
                  fill={getColorForValue(data.find(d => d.id === "MT")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("MT")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Mato Grosso do Sul */}
                <path 
                  id="MS" 
                  d="M250,490 L320,540 L300,610 L270,620 L240,570 L220,520 Z" 
                  fill={getColorForValue(data.find(d => d.id === "MS")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("MS")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Goiás */}
                <path 
                  id="GO" 
                  d="M320,540 L340,480 L370,510 L400,530 L390,580 L350,590 L320,580 Z" 
                  fill={getColorForValue(data.find(d => d.id === "GO")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("GO")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Distrito Federal */}
                <path 
                  id="DF" 
                  d="M370,530 L380,520 L390,530 L380,540 Z" 
                  fill={getColorForValue(data.find(d => d.id === "DF")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("DF")}
                  onMouseLeave={handleStateLeave}
                />
              </g>
              
              <g id="sudeste">
                {/* São Paulo */}
                <path 
                  id="SP" 
                  d="M300,610 L320,580 L350,590 L390,580 L400,610 L380,640 L340,650 L320,630 Z" 
                  fill={getColorForValue(data.find(d => d.id === "SP")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("SP")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Minas Gerais */}
                <path 
                  id="MG" 
                  d="M400,530 L460,570 L450,620 L400,610 L390,580 Z" 
                  fill={getColorForValue(data.find(d => d.id === "MG")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("MG")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Rio de Janeiro */}
                <path 
                  id="RJ" 
                  d="M450,620 L470,630 L450,660 L420,670 L380,640 L400,610 Z" 
                  fill={getColorForValue(data.find(d => d.id === "RJ")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("RJ")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Espírito Santo */}
                <path 
                  id="ES" 
                  d="M460,570 L520,590 L510,620 L470,630 L450,620 Z" 
                  fill={getColorForValue(data.find(d => d.id === "ES")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("ES")}
                  onMouseLeave={handleStateLeave}
                />
              </g>
              
              <g id="sul">
                {/* Paraná */}
                <path 
                  id="PR" 
                  d="M270,620 L300,610 L320,630 L340,650 L320,680 L270,670 Z" 
                  fill={getColorForValue(data.find(d => d.id === "PR")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("PR")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Santa Catarina */}
                <path 
                  id="SC" 
                  d="M270,670 L320,680 L310,720 L260,710 Z" 
                  fill={getColorForValue(data.find(d => d.id === "SC")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("SC")}
                  onMouseLeave={handleStateLeave}
                />
                {/* Rio Grande do Sul */}
                <path 
                  id="RS" 
                  d="M260,710 L310,720 L300,780 L250,780 L220,750 Z" 
                  fill={getColorForValue(data.find(d => d.id === "RS")?.value || 0)}
                  stroke="#152538"
                  strokeWidth="1"
                  onMouseEnter={() => handleStateHover("RS")}
                  onMouseLeave={handleStateLeave}
                />
              </g>
            </svg>
          </div>
          
          {/* Tooltip customizado */}
          {selectedState && selectedStateData && (
            <div className="absolute top-4 right-4 bg-white p-4 shadow-lg rounded-md border border-gray-200 z-10">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedStateData.name}</h3>
              <p className="text-blue-600 font-medium">{selectedStateData.value} envios</p>
            </div>
          )}
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

export default SimpleBrasilMap;