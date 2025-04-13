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
  Legend 
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface VolumeComprasChartProps {
  data?: {
    mes: string;
    valor: number;
  }[];
  period?: 'monthly' | 'quarterly' | 'yearly';
  title?: string;
  description?: string;
  className?: string;
}

export default function VolumeComprasChart({
  data,
  period = 'monthly',
  title = 'Volume de Compras',
  description = 'Valor total de compras por período',
  className
}: VolumeComprasChartProps) {
  // Dados de exemplo para quando não há dados reais fornecidos
  const sampleData = [
    { mes: 'Jan', valor: 24500 },
    { mes: 'Fev', valor: 35800 },
    { mes: 'Mar', valor: 28900 },
    { mes: 'Abr', valor: 42100 },
    { mes: 'Mai', valor: 38500 },
    { mes: 'Jun', valor: 35700 },
  ];

  const chartData = data || sampleData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm">{`Valor: ${formatCurrency(payload[0].value)}`}</p>
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
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="mes" 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `R$${value/1000}k`} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="valor" 
              fill="#16a34a" 
              radius={[4, 4, 0, 0]}
              barSize={40} 
              fillOpacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}