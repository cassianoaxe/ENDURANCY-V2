'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CircleArrowUp, CircleArrowDown, Percent, ArrowDown, ArrowUp } from 'lucide-react';

interface CardValorProps {
  titulo: string;
  valor: number;
  porcentagem?: number;
  tipo: 'receita' | 'despesa' | 'neutro';
}

export default function CardValor({ titulo, valor, porcentagem, tipo }: CardValorProps) {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const icone = (() => {
    switch (tipo) {
      case 'receita':
        return <CircleArrowUp className="h-5 w-5 text-green-500" />;
      case 'despesa':
        return <CircleArrowDown className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  })();

  const tendencia = porcentagem ? (
    <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${porcentagem > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {porcentagem > 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
      {Math.abs(porcentagem)}%
    </div>
  ) : null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatter.format(valor)}</p>
              {tendencia}
            </div>
          </div>
          {icone}
        </div>
      </CardContent>
    </Card>
  );
}