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
  Cell, 
  Legend 
} from 'recharts';

interface TarefaPorStatus {
  status: string;
  quantidade: number;
  cor: string;
}

interface TarefasPorStatusChartProps {
  data?: TarefaPorStatus[];
  titulo?: string;
  altura?: number;
  className?: string;
}

export default function TarefasPorStatusChart({ 
  data = [], 
  titulo = "Tarefas por Status",
  altura = 300,
  className = ""
}: TarefasPorStatusChartProps) {
  
  // Dados para o gráfico (usamos os dados mockados se não forem fornecidos)
  const chartData = data.length > 0 ? data : [
    { status: 'Backlog', quantidade: 0, cor: '#94a3b8' },
    { status: 'Todo', quantidade: 0, cor: '#3b82f6' },
    { status: 'In_progress', quantidade: 0, cor: '#8b5cf6' },
    { status: 'Review', quantidade: 0, cor: '#f59e0b' },
    { status: 'Done', quantidade: 0, cor: '#10b981' }
  ];

  // Formatar o status para exibição
  const formatStatus = (status: string) => {
    switch(status.toLowerCase()) {
      case 'backlog': return 'Backlog';
      case 'todo': return 'A Fazer';
      case 'in_progress': return 'Em Progresso';
      case 'review': return 'Revisão';
      case 'done': return 'Concluído';
      default: return status;
    }
  };

  // Customizar o tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{formatStatus(payload[0].payload.status)}</p>
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
              barSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="status" 
                tickFormatter={formatStatus}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="quantidade" 
                name="Quantidade" 
                radius={[4, 4, 0, 0]}
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