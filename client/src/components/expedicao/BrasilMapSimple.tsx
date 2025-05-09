import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { Package, AlertCircle, Loader2 } from 'lucide-react';

interface BrasilMapSimpleProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  fullscreen?: boolean;
}

interface StateData {
  id: string;
  name: string;
  value: number;
}

interface StateDetail {
  estado: string;
  sigla: string;
  totalEnvios: number;
  detalhamento: {
    medicamentos: number;
    suplementos: number;
    outros: number;
  };
  percentualTotal: number;
  cidadesPrincipais: Array<{
    cidade: string;
    envios: number;
  }>;
}

const BrasilMapSimple: React.FC<BrasilMapSimpleProps> = ({ period, fullscreen = false }) => {
  const [activeState, setActiveState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Buscar dados de envios por estado
  const { 
    data: statesData,
    isLoading: isLoadingStates,
    error: statesError
  } = useQuery<StateData[]>({
    queryKey: [`/api/expedicao/envios-por-estado/${period}`],
    refetchOnWindowFocus: false
  });
  
  // Buscar detalhes do estado quando um estado é selecionado
  const {
    data: stateDetail,
    isLoading: isLoadingDetail,
    error: detailError,
    refetch: refetchDetail
  } = useQuery<StateDetail>({
    queryKey: [`/api/expedicao/detalhe-estado/${activeState}/${period}`],
    enabled: !!activeState,
    refetchOnWindowFocus: false
  });
  
  // Atualizar detalhes do estado quando o período ou estado ativo muda
  useEffect(() => {
    if (activeState) {
      refetchDetail();
    }
  }, [period, activeState, refetchDetail]);
  
  // Função para definir cores com base no valor
  const getColorByValue = (value: number, max: number) => {
    // Escala de cores de azul claro para azul escuro
    const minColor = [240, 249, 255]; // Azul muito claro
    const maxColor = [0, 108, 185];   // Azul escuro
    
    // Calcular proporção (garantir pelo menos 0.05 para valores pequenos terem alguma cor)
    const ratio = Math.max(0.05, Math.min(1, value / max));
    
    // Interpolação linear entre as cores
    const r = Math.round(minColor[0] + ratio * (maxColor[0] - minColor[0]));
    const g = Math.round(minColor[1] + ratio * (maxColor[1] - minColor[1]));
    const b = Math.round(minColor[2] + ratio * (maxColor[2] - minColor[2]));
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Se estiver carregando, exibir indicador
  if (isLoadingStates) {
    return (
      <Card className={`${fullscreen ? 'h-[calc(100vh-10rem)]' : 'h-[450px]'} flex flex-col items-center justify-center`}>
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando dados do mapa...</p>
      </Card>
    );
  }
  
  // Se houver erro, exibir mensagem
  if (statesError || !statesData) {
    return (
      <Card className={`${fullscreen ? 'h-[calc(100vh-10rem)]' : 'h-[450px]'} flex flex-col items-center justify-center p-6`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
        <p className="text-muted-foreground text-center">
          Não foi possível obter os dados de envios por estado. 
          Por favor, tente novamente mais tarde.
        </p>
      </Card>
    );
  }
  
  // Encontrar o valor máximo para a escala de cores
  const maxValue = Math.max(...statesData.map(state => state.value));
  
  // Função para lidar com o clique em um estado
  const handleStateClick = (stateId: string, e: React.MouseEvent) => {
    setActiveState(activeState === stateId ? null : stateId);
    
    // Posicionar o tooltip próximo ao cursor
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    setShowTooltip(activeState !== stateId);
  };
  
  return (
    <Card className={`relative overflow-hidden ${fullscreen ? 'h-[calc(100vh-10rem)]' : 'h-[450px]'} p-6 bg-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary" />
          Distribuição de Envios pelo Brasil
        </h3>
        <div className="text-xs text-muted-foreground">
          {statesData.reduce((sum, state) => sum + state.value, 0)} envios no período
        </div>
      </div>
      
      <div className={`${fullscreen ? 'h-[calc(100vh-14rem)]' : 'h-[350px]'} flex items-center justify-center relative`}>
        {/* Implementação simplificada - Exibindo uma lista de estados com cores ao invés de um mapa SVG */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 w-full max-w-4xl">
          {statesData.map(state => (
            <div
              key={state.id}
              className="border rounded-md p-2 cursor-pointer transform hover:scale-105 transition-transform"
              style={{ 
                backgroundColor: getColorByValue(state.value, maxValue),
                color: state.value > maxValue * 0.5 ? 'white' : 'black'
              }}
              onClick={(e) => handleStateClick(state.id, e)}
            >
              <div className="font-bold">{state.id}</div>
              <div className="text-xs">{state.value} envios</div>
            </div>
          ))}
        </div>
        
        {/* Legenda */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 p-2 rounded-md border text-xs">
          <div className="mb-1 font-medium">Quantidade de Envios</div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-1" style={{ backgroundColor: getColorByValue(0, maxValue) }}></div>
            <span>Baixo</span>
            <div className="w-4 h-4 mx-1" style={{ backgroundColor: getColorByValue(maxValue/2, maxValue) }}></div>
            <span>Médio</span>
            <div className="w-4 h-4 ml-1" style={{ backgroundColor: getColorByValue(maxValue, maxValue) }}></div>
            <span>Alto</span>
          </div>
        </div>
      </div>
      
      {/* Tooltip com detalhes do estado */}
      {showTooltip && activeState && (
        <div 
          className="absolute bg-white shadow-lg border rounded-lg p-3 z-10 w-64"
          style={{
            top: tooltipPosition.y > window.innerHeight / 2 ? 
              tooltipPosition.y - 250 : tooltipPosition.y + 10,
            left: tooltipPosition.x > window.innerWidth / 2 ? 
              tooltipPosition.x - 270 : tooltipPosition.x + 10
          }}
        >
          {isLoadingDetail ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : detailError ? (
            <div className="text-red-500 text-sm">Erro ao carregar detalhes</div>
          ) : stateDetail ? (
            <div>
              <div className="font-bold text-lg border-b pb-1 mb-2">
                {stateDetail.estado} ({stateDetail.sigla})
              </div>
              <div className="text-sm mb-2">
                <span className="font-medium">Total de envios:</span> {stateDetail.totalEnvios}
                <span className="text-xs ml-1 text-muted-foreground">
                  ({stateDetail.percentualTotal}% do total)
                </span>
              </div>
              
              <div className="text-sm font-medium mb-1">Detalhamento:</div>
              <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
                <div className="bg-blue-50 p-1 rounded">
                  <div className="font-medium">Medicamentos</div>
                  <div>{stateDetail.detalhamento.medicamentos}</div>
                </div>
                <div className="bg-green-50 p-1 rounded">
                  <div className="font-medium">Suplementos</div>
                  <div>{stateDetail.detalhamento.suplementos}</div>
                </div>
                <div className="bg-orange-50 p-1 rounded">
                  <div className="font-medium">Outros</div>
                  <div>{stateDetail.detalhamento.outros}</div>
                </div>
              </div>
              
              <div className="text-sm font-medium mb-1">Principais cidades:</div>
              <div className="text-xs">
                {stateDetail.cidadesPrincipais.map((cidade, index) => (
                  <div key={index} className="flex justify-between items-center mb-1">
                    <span>{cidade.cidade}</span>
                    <span className="bg-gray-100 px-1 rounded">{cidade.envios} envios</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
          <button 
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setShowTooltip(false);
              setActiveState(null);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </Card>
  );
};

export default BrasilMapSimple;