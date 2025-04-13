'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dados mockados para demonstração
const DATA = [
  { mes: 'Jan', receitas: 75000, despesas: 65000 },
  { mes: 'Fev', receitas: 85000, despesas: 72000 },
  { mes: 'Mar', receitas: 90000, despesas: 75000 },
  { mes: 'Abr', receitas: 95000, despesas: 80000 },
  { mes: 'Mai', receitas: 100000, despesas: 79000 },
  { mes: 'Jun', receitas: 110000, despesas: 85000 },
  { mes: 'Jul', receitas: 95000, despesas: 90000 },
  { mes: 'Ago', receitas: 105000, despesas: 88000 },
  { mes: 'Set', receitas: 115000, despesas: 90000 },
  { mes: 'Out', receitas: 120000, despesas: 95000 },
  { mes: 'Nov', receitas: 130000, despesas: 100000 },
  { mes: 'Dez', receitas: 150000, despesas: 110000 },
];

interface GraficoLinhasProps {
  titulo: string;
  periodoInicial?: 'mensal' | 'trimestral' | 'anual';
}

export default function GraficoLinhas({ titulo, periodoInicial = 'mensal' }: GraficoLinhasProps) {
  const [periodo, setPeriodo] = useState(periodoInicial);
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

  const dadosFiltrados = (() => {
    switch (periodo) {
      case 'trimestral':
        return [
          { mes: 'T1', receitas: DATA.slice(0, 3).reduce((sum, item) => sum + item.receitas, 0) / 3, despesas: DATA.slice(0, 3).reduce((sum, item) => sum + item.despesas, 0) / 3 },
          { mes: 'T2', receitas: DATA.slice(3, 6).reduce((sum, item) => sum + item.receitas, 0) / 3, despesas: DATA.slice(3, 6).reduce((sum, item) => sum + item.despesas, 0) / 3 },
          { mes: 'T3', receitas: DATA.slice(6, 9).reduce((sum, item) => sum + item.receitas, 0) / 3, despesas: DATA.slice(6, 9).reduce((sum, item) => sum + item.despesas, 0) / 3 },
          { mes: 'T4', receitas: DATA.slice(9, 12).reduce((sum, item) => sum + item.receitas, 0) / 3, despesas: DATA.slice(9, 12).reduce((sum, item) => sum + item.despesas, 0) / 3 },
        ];
      case 'anual':
        return [
          { mes: '2023', receitas: DATA.reduce((sum, item) => sum + item.receitas, 0) / 12, despesas: DATA.reduce((sum, item) => sum + item.despesas, 0) / 12 },
        ];
      default:
        return DATA;
    }
  })();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {titulo}
        </CardTitle>
        <div>
          <Select
            value={periodo}
            onValueChange={(value) => setPeriodo(value as 'mensal' | 'trimestral' | 'anual')}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dadosFiltrados}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatter.format(value)} />
              <Tooltip formatter={(value) => formatter.format(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#10b981" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}