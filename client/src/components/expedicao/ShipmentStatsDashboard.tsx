import React from 'react';
import { Card, Heading } from '@/components/ui';
import { TrendingUp, TrendingDown, Package, Clock, DollarSign, Truck, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ShipmentStatsDashboardProps {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface ShipmentStats {
  totalEnvios: number;
  enviosPorStatus: {
    emTransito: number;
    entregues: number;
    atrasados: number;
    problemas: number;
  };
  mediaTempo: {
    preparacao: number;
    transporte: number;
    entrega: number;
  };
  custoMedio: {
    valor: number;
    variacao: number;
  };
}

const ShipmentStatsDashboard: React.FC<ShipmentStatsDashboardProps> = ({ period }) => {
  const { data: stats, isLoading, error } = useQuery<ShipmentStats>({
    queryKey: [`/api/expedicao/estatisticas/${period}`],
    refetchOnWindowFocus: false
  });
  
  if (isLoading) {
    return (
      <Card className="p-4 shadow-md h-full">
        <div className="h-full flex flex-col items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground text-sm">Carregando estatísticas...</p>
        </div>
      </Card>
    );
  }
  
  if (error || !stats) {
    return (
      <Card className="p-4 shadow-md h-full">
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <Heading as="h3" size="sm" className="text-center mb-2">Erro ao carregar dados</Heading>
          <p className="text-muted-foreground text-sm text-center">
            Não foi possível obter as estatísticas de envio. Tente novamente mais tarde.
          </p>
        </div>
      </Card>
    );
  }
  
  // Formatação dos números para exibição
  const formatNumber = (num: number) => num.toLocaleString('pt-BR');
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  
  return (
    <Card className="shadow-md h-full divide-y divide-gray-100">
      <div className="p-4">
        <Heading as="h2" size="lg" weight="semibold" className="mb-2">
          Dashboard de Envios
        </Heading>
        <p className="text-muted-foreground text-sm">
          Período: {
            period === 'daily' ? 'Diário' : 
            period === 'weekly' ? 'Semanal' : 
            period === 'monthly' ? 'Mensal' : 'Anual'
          }
        </p>
      </div>
      
      {/* Resumo de envios totais */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Total de Envios</span>
          <div className="flex items-center">
            <Package className="w-4 h-4 text-primary mr-1" />
          </div>
        </div>
        <div className="text-2xl font-bold">{formatNumber(stats.totalEnvios)}</div>
      </div>
      
      {/* Status dos envios */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Status dos Envios</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="flex items-center mb-1">
              <Truck className="h-3.5 w-3.5 text-blue-600 mr-1" />
              <span className="text-xs font-medium text-blue-600">Em Trânsito</span>
            </div>
            <div className="text-sm font-bold">{formatNumber(stats.enviosPorStatus.emTransito)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="flex items-center mb-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-600">Entregues</span>
            </div>
            <div className="text-sm font-bold">{formatNumber(stats.enviosPorStatus.entregues)}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2">
            <div className="flex items-center mb-1">
              <Clock className="h-3.5 w-3.5 text-yellow-600 mr-1" />
              <span className="text-xs font-medium text-yellow-600">Atrasados</span>
            </div>
            <div className="text-sm font-bold">{formatNumber(stats.enviosPorStatus.atrasados)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <div className="flex items-center mb-1">
              <HelpCircle className="h-3.5 w-3.5 text-red-600 mr-1" />
              <span className="text-xs font-medium text-red-600">Problemas</span>
            </div>
            <div className="text-sm font-bold">{formatNumber(stats.enviosPorStatus.problemas)}</div>
          </div>
        </div>
      </div>
      
      {/* Tempo médio */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Tempo Médio</span>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-primary mr-1" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Preparação</span>
            <span className="text-xs font-medium">{stats.mediaTempo.preparacao} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Transporte</span>
            <span className="text-xs font-medium">{stats.mediaTempo.transporte} horas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Entrega</span>
            <span className="text-xs font-medium">{stats.mediaTempo.entrega} horas</span>
          </div>
        </div>
      </div>
      
      {/* Custo médio */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Custo Médio por Envio</span>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-primary mr-1" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">{formatCurrency(stats.custoMedio.valor)}</div>
          <div className={`flex items-center text-xs font-medium ${stats.custoMedio.variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.custoMedio.variacao >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 mr-1" />
            )}
            {formatPercentage(stats.custoMedio.variacao)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ShipmentStatsDashboard;