import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileBarChart, TrendingDown, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RelatorioFinanceiroCardProps {
  relatorio: {
    id: number;
    titulo: string;
    descricao: string | null;
    ano: number;
    mes: number | null;
    totalReceitas: number;
    totalDespesas: number;
    receitasPorCategoria: Record<string, number> | null;
    despesasPorCategoria: Record<string, number> | null;
    receitasMensais: Record<string, number> | null;
    despesasMensais: Record<string, number> | null;
    publicado: boolean;
  };
  onClick?: () => void;
}

const getMesNome = (mes: number) => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return meses[mes - 1];
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const RelatorioFinanceiroCard: React.FC<RelatorioFinanceiroCardProps> = ({ relatorio, onClick }) => {
  const saldo = relatorio.totalReceitas - relatorio.totalDespesas;
  const isSaldoPositivo = saldo >= 0;
  
  // Calcular as duas principais categorias de receita
  const principaisReceitas = relatorio.receitasPorCategoria 
    ? Object.entries(relatorio.receitasPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
    : [];
    
  // Calcular as duas principais categorias de despesa
  const principaisDespesas = relatorio.despesasPorCategoria 
    ? Object.entries(relatorio.despesasPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
    : [];
  
  return (
    <Card 
      className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {relatorio.mes 
                ? `${getMesNome(relatorio.mes)} de ${relatorio.ano}` 
                : `Relatório Anual ${relatorio.ano}`}
            </CardTitle>
            {relatorio.titulo && (
              <CardDescription>{relatorio.titulo}</CardDescription>
            )}
          </div>
          <div className={`flex items-center text-sm font-medium ${isSaldoPositivo ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">Saldo</span>
            {isSaldoPositivo ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {relatorio.descricao && (
          <p className="text-sm text-gray-700 mb-3">{relatorio.descricao}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-center text-green-700 text-sm font-medium mb-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Receitas</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              {formatCurrency(relatorio.totalReceitas)}
            </div>
            
            {principaisReceitas.length > 0 && (
              <div className="mt-1">
                {principaisReceitas.map(([categoria, valor], index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between text-xs text-green-600 mt-1">
                          <span className="truncate">{categoria}</span>
                          <span>{formatCurrency(valor)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {categoria}: {formatCurrency(valor)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-red-50 p-3 rounded-md">
            <div className="flex items-center text-red-700 text-sm font-medium mb-1">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>Despesas</span>
            </div>
            <div className="text-lg font-bold text-red-800">
              {formatCurrency(relatorio.totalDespesas)}
            </div>
            
            {principaisDespesas.length > 0 && (
              <div className="mt-1">
                {principaisDespesas.map(([categoria, valor], index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between text-xs text-red-600 mt-1">
                          <span className="truncate">{categoria}</span>
                          <span>{formatCurrency(valor)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {categoria}: {formatCurrency(valor)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex items-center justify-between p-2 rounded-md ${isSaldoPositivo ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex items-center">
            <DollarSign className={`w-4 h-4 mr-1 ${isSaldoPositivo ? 'text-green-700' : 'text-red-700'}`} />
            <span className={`text-sm font-medium ${isSaldoPositivo ? 'text-green-700' : 'text-red-700'}`}>
              Saldo final
            </span>
          </div>
          <span className={`text-base font-bold ${isSaldoPositivo ? 'text-green-800' : 'text-red-800'}`}>
            {formatCurrency(saldo)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-center text-sm" 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <FileBarChart className="w-4 h-4 mr-2" />
          Ver relatório completo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RelatorioFinanceiroCard;