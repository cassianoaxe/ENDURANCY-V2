'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

// Dados mockados de solicitações por status
const data = [
  { status: 'Pendentes', quantidade: 3, cor: '#f59e0b' },
  { status: 'Em Cotação', quantidade: 5, cor: '#3b82f6' },
  { status: 'Aprovadas', quantidade: 8, cor: '#10b981' },
  { status: 'Aguardando Entrega', quantidade: 4, cor: '#8b5cf6' },
  { status: 'Recebidas', quantidade: 12, cor: '#22c55e' },
  { status: 'Rejeitadas', quantidade: 2, cor: '#ef4444' },
];

// Custom tooltip para o gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-background border shadow-sm p-2">
        <p className="text-sm font-medium">{`${label}`}</p>
        <p className="text-sm font-bold">
          <span style={{ color: payload[0].payload.cor }}>
            {`${payload[0].value} solicitações`}
          </span>
        </p>
      </Card>
    );
  }

  return null;
};

export function SolicitacoesPorStatusChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
        <XAxis 
          type="number" 
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          dataKey="status" 
          type="category" 
          scale="band" 
          tick={{ fontSize: 12 }}
          width={120}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {data.map((entry) => (
          <Bar 
            key={entry.status}
            dataKey="quantidade" 
            fill={entry.cor}
            radius={[0, 4, 4, 0]}
            barSize={20}
            fillOpacity={0.8}
            background={{ fill: '#f5f5f5' }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}