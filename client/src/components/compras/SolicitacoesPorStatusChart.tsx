import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell
} from 'recharts';

interface SolicitacoesPorStatusChartProps {
  data?: {
    status: string;
    quantidade: number;
    cor: string;
  }[];
  period?: 'weekly' | 'monthly' | 'yearly';
  title?: string;
  description?: string;
  className?: string;
}

export default function SolicitacoesPorStatusChart({
  data,
  period = 'monthly',
  title = 'Solicitações por Status',
  description = 'Distribuição das solicitações de compra por status',
  className
}: SolicitacoesPorStatusChartProps) {
  // Dados de exemplo para quando não há dados reais fornecidos
  const sampleData = [
    { status: 'Pendente', quantidade: 12, cor: '#fbbf24' },
    { status: 'Aprovada', quantidade: 8, cor: '#16a34a' },
    { status: 'Em Cotação', quantidade: 5, cor: '#3b82f6' },
    { status: 'Concluída', quantidade: 7, cor: '#8b5cf6' },
    { status: 'Cancelada', quantidade: 3, cor: '#ef4444' },
  ];

  const data2 = data || sampleData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium" style={{ color: payload[0].payload.cor }}>{payload[0].payload.status}</p>
          <p className="text-sm">Quantidade: {payload[0].value}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data2}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 15,
            }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              dataKey="status" 
              type="category"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {data2.map((entry) => (
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
      </CardContent>
    </Card>
  );
}