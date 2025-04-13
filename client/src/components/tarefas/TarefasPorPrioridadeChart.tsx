import React from 'react';
import { 
  Card,
  CardContent,
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

interface TarefaPorPrioridade {
  prioridade: string;
  quantidade: number;
  cor: string;
}

interface TarefasPorPrioridadeChartProps {
  data?: TarefaPorPrioridade[];
  titulo?: string;
  altura?: number;
  className?: string;
}

export default function TarefasPorPrioridadeChart({ 
  data = [], 
  titulo = "Tarefas por Prioridade",
  altura = 300,
  className = ""
}: TarefasPorPrioridadeChartProps) {
  
  // Dados para o gráfico (usamos os dados mockados se não forem fornecidos)
  const chartData = data.length > 0 ? data : [
    { prioridade: 'Low', quantidade: 0, cor: '#94a3b8' },
    { prioridade: 'Medium', quantidade: 0, cor: '#3b82f6' },
    { prioridade: 'High', quantidade: 0, cor: '#f59e0b' },
    { prioridade: 'Urgent', quantidade: 0, cor: '#ef4444' }
  ];

  // Formatar a prioridade para exibição
  const formatPrioridade = (prioridade: string) => {
    switch(prioridade.toLowerCase()) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return prioridade;
    }
  };

  // Customizar o tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">Prioridade {formatPrioridade(payload[0].payload.prioridade)}</p>
          <p className="text-sm">
            <span className="font-medium">{payload[0].value}</span> tarefas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: altura }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              layout="vertical"
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                tickMargin={10}
                allowDecimals={false}
              />
              <YAxis 
                dataKey="prioridade" 
                type="category"
                tickFormatter={formatPrioridade}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="quantidade" 
                name="Quantidade"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}