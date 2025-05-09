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
interface BrasilSVGMapProps {
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

// Mapa SVG do Brasil baseado na forma real
const BrasilSVGMap: React.FC<BrasilSVGMapProps> = ({ 
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
    const baseColor = 230; // tom base de azul
    const minIntensity = 240; // valor mais claro (quase branco)
    const maxIntensity = 100; // valor mais escuro (azul médio)
    
    // Cálculo da intensidade baseado no valor normalizado
    const intensity = Math.floor(minIntensity - normalizedValue * (minIntensity - maxIntensity));
    
    return `rgb(${intensity}, ${intensity}, ${Math.min(255, intensity + baseColor - 100)})`;
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
        
        <div className={`${mapHeight} relative bg-sky-50 flex justify-center items-center p-4`}>
          {/* Mapa SVG mais preciso do Brasil */}
          <div className="w-full h-full relative">
            <svg 
              viewBox="0 0 800 950" 
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))' }}
              id="brasil-map"
            >
              {/* Estado: São Paulo (SP) */}
              <path 
                d="M394,659 L432,638 L484,650 L502,647 L502,667 L520,685 L513,708 L477,718 L441,701 L425,707 L395,676 Z" 
                id="SP" 
                fill={getColorForValue(data.find(d => d.id === "SP")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("SP")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Rio de Janeiro (RJ) */}
              <path 
                d="M502,667 L520,685 L513,708 L530,718 L554,704 L564,710 L539,725 L504,723 L486,707 Z" 
                id="RJ" 
                fill={getColorForValue(data.find(d => d.id === "RJ")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("RJ")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Minas Gerais (MG) */}
              <path 
                d="M394,659 L432,638 L484,650 L502,647 L502,667 L486,707 L504,723 L456,750 L433,744 L405,714 L380,701 L364,674 L384,662 Z" 
                id="MG" 
                fill={getColorForValue(data.find(d => d.id === "MG")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("MG")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Espírito Santo (ES) */}
              <path 
                d="M504,723 L539,725 L564,710 L568,668 L539,650 L522,652 L502,667 L486,707 Z" 
                id="ES" 
                fill={getColorForValue(data.find(d => d.id === "ES")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("ES")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Bahia (BA) */}
              <path 
                d="M522,652 L539,650 L568,668 L575,639 L590,614 L605,566 L557,506 L522,509 L471,507 L446,532 L426,585 L448,612 L480,617 L500,645 Z" 
                id="BA" 
                fill={getColorForValue(data.find(d => d.id === "BA")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("BA")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Sergipe (SE) */}
              <path 
                d="M590,614 L605,566 L618,549 L633,553 L621,578 L606,586 L597,604 Z" 
                id="SE" 
                fill={getColorForValue(data.find(d => d.id === "SE")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("SE")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Alagoas (AL) */}
              <path 
                d="M605,566 L618,549 L644,537 L661,536 L642,556 L633,553 Z" 
                id="AL" 
                fill={getColorForValue(data.find(d => d.id === "AL")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("AL")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Pernambuco (PE) */}
              <path 
                d="M557,506 L618,549 L644,537 L661,536 L679,510 L622,498 L594,493 L565,494 Z" 
                id="PE" 
                fill={getColorForValue(data.find(d => d.id === "PE")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("PE")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Paraíba (PB) */}
              <path 
                d="M594,493 L622,498 L679,510 L685,483 L667,475 L630,478 L596,481 Z" 
                id="PB" 
                fill={getColorForValue(data.find(d => d.id === "PB")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("PB")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Rio Grande do Norte (RN) */}
              <path 
                d="M630,478 L667,475 L685,483 L715,459 L681,440 L650,454 L619,460 Z" 
                id="RN" 
                fill={getColorForValue(data.find(d => d.id === "RN")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("RN")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Ceará (CE) */}
              <path 
                d="M596,481 L619,460 L650,454 L681,440 L654,401 L624,365 L576,367 L558,389 L549,423 L569,452 L592,469 Z" 
                id="CE" 
                fill={getColorForValue(data.find(d => d.id === "CE")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("CE")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Piauí (PI) */}
              <path 
                d="M522,509 L565,494 L596,481 L592,469 L569,452 L549,423 L558,389 L576,367 L536,356 L519,380 L513,415 L507,440 L501,469 L509,492 Z" 
                id="PI" 
                fill={getColorForValue(data.find(d => d.id === "PI")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("PI")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Maranhão (MA) */}
              <path 
                d="M536,356 L519,380 L513,415 L507,440 L501,469 L509,492 L472,507 L446,532 L426,585 L403,550 L375,539 L361,519 L371,476 L395,443 L428,428 L449,404 L482,397 L513,378 Z" 
                id="MA" 
                fill={getColorForValue(data.find(d => d.id === "MA")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("MA")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Tocantins (TO) */}
              <path 
                d="M426,585 L448,612 L480,617 L500,645 L484,650 L432,638 L394,659 L384,662 L364,674 L353,626 L370,586 L400,544 L403,550 Z" 
                id="TO" 
                fill={getColorForValue(data.find(d => d.id === "TO")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("TO")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Goiás (GO) */}
              <path 
                d="M353,626 L364,674 L380,701 L405,714 L433,744 L387,761 L356,724 L318,709 L308,669 L321,626 Z" 
                id="GO" 
                fill={getColorForValue(data.find(d => d.id === "GO")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("GO")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Distrito Federal (DF) */}
              <path 
                d="M375,669 L395,665 L395,685 L378,690 Z" 
                id="DF" 
                fill={getColorForValue(data.find(d => d.id === "DF")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("DF")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Mato Grosso (MT) */}
              <path 
                d="M223,548 L277,495 L353,469 L371,476 L361,519 L375,539 L403,550 L400,544 L370,586 L353,626 L321,626 L308,669 L262,620 L232,593 Z" 
                id="MT" 
                fill={getColorForValue(data.find(d => d.id === "MT")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("MT")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Mato Grosso do Sul (MS) */}
              <path 
                d="M308,669 L318,709 L356,724 L387,761 L372,779 L348,796 L311,811 L273,785 L246,735 L260,709 L262,620 Z" 
                id="MS" 
                fill={getColorForValue(data.find(d => d.id === "MS")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("MS")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: São Paulo (parte Oeste) - Continuação */}
              <path 
                d="M387,761 L372,779 L348,796 L311,811 L355,823 L391,819 L425,798 L455,775 L456,750 L433,744 Z" 
                id="SP-West" 
                fill={getColorForValue(data.find(d => d.id === "SP")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("SP")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Paraná (PR) */}
              <path 
                d="M311,811 L355,823 L391,819 L425,798 L442,818 L440,844 L419,871 L360,881 L322,865 L301,841 L296,814 Z" 
                id="PR" 
                fill={getColorForValue(data.find(d => d.id === "PR")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("PR")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Santa Catarina (SC) */}
              <path 
                d="M322,865 L360,881 L419,871 L426,891 L404,917 L362,936 L319,920 L292,903 L295,881 Z" 
                id="SC" 
                fill={getColorForValue(data.find(d => d.id === "SC")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("SC")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Rio Grande do Sul (RS) */}
              <path 
                d="M319,920 L362,936 L404,917 L426,891 L413,939 L392,973 L355,995 L316,1003 L279,989 L247,949 L251,936 L286,925 Z" 
                id="RS" 
                fill={getColorForValue(data.find(d => d.id === "RS")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("RS")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Pará (PA) */}
              <path 
                d="M449,404 L428,428 L395,443 L371,476 L353,469 L277,495 L223,548 L215,500 L187,465 L207,425 L232,405 L267,387 L307,379 L354,352 L394,338 L420,349 L445,377 Z" 
                id="PA" 
                fill={getColorForValue(data.find(d => d.id === "PA")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("PA")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Amapá (AP) */}
              <path 
                d="M354,352 L394,338 L420,349 L445,377 L449,404 L482,397 L513,378 L526,341 L515,319 L479,312 L443,324 L412,321 L389,334 Z" 
                id="AP" 
                fill={getColorForValue(data.find(d => d.id === "AP")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("AP")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Amazonas (AM) */}
              <path 
                d="M232,405 L207,425 L187,465 L215,500 L223,548 L232,593 L200,570 L157,561 L122,526 L95,485 L75,437 L54,402 L94,354 L138,337 L187,337 L232,375 Z" 
                id="AM" 
                fill={getColorForValue(data.find(d => d.id === "AM")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("AM")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Roraima (RR) */}
              <path 
                d="M232,375 L267,387 L307,379 L354,352 L389,334 L371,295 L337,260 L295,244 L251,252 L219,277 L207,310 Z" 
                id="RR" 
                fill={getColorForValue(data.find(d => d.id === "RR")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("RR")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Acre (AC) */}
              <path 
                d="M54,402 L94,354 L138,337 L187,337 L232,375 L207,310 L219,277 L191,271 L150,275 L109,290 L75,320 L59,369 Z" 
                id="AC" 
                fill={getColorForValue(data.find(d => d.id === "AC")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("AC")}
                onMouseLeave={handleStateLeave}
              />
              
              {/* Estado: Rondônia (RO) */}
              <path 
                d="M157,561 L200,570 L232,593 L262,620 L260,709 L246,735 L207,708 L168,694 L136,658 L118,624 L107,584 L122,526 Z" 
                id="RO" 
                fill={getColorForValue(data.find(d => d.id === "RO")?.value || 0)}
                stroke="#152538"
                strokeWidth="1"
                onMouseEnter={() => handleStateHover("RO")}
                onMouseLeave={handleStateLeave}
              />
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

export default BrasilSVGMap;