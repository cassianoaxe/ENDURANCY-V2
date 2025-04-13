'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

// Dados mockados de volume de compras
const data = [
  { mes: 'Jan', total: 12800 },
  { mes: 'Fev', total: 14500 },
  { mes: 'Mar', total: 18200 },
  { mes: 'Abr', total: 16900 },
  { mes: 'Mai', total: 21500 },
  { mes: 'Jun', total: 19800 },
  { mes: 'Jul', total: 24300 },
];

// Formata valores para moeda brasileira
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom tooltip para o gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-background border shadow-sm p-2">
        <p className="text-sm font-medium">{`${label}`}</p>
        <p className="text-sm font-bold text-primary">{formatCurrency(payload[0].value)}</p>
      </Card>
    );
  }

  return null;
};

export function VolumeComprasChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="mes" 
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={(value) => `R$ ${value / 1000}k`}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="total" 
          fill="rgba(99, 102, 241, 0.8)" 
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}