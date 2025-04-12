// Componentes de gráficos para o dashboard
// Usando recharts para visualização de dados

import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Legend,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface ChartProps {
  data: any;
  height?: number | string;
}

// Gráfico de linhas
export function LineChart({ data, height = "100%" }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data.labels.map((label: string, index: number) => ({
          name: label,
          value: data.datasets[0].data[index],
        }))}
        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
        />
        <YAxis 
          width={40}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value}`, data.datasets[0].label || "Valor"]}
          labelFormatter={(label) => `${label}`}
          contentStyle={{ 
            backgroundColor: "white", 
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "none",
            padding: "8px 12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={data.datasets[0].borderColor || "#3b82f6"}
          strokeWidth={2}
          dot={true}
          activeDot={{ r: 6 }}
          name={data.datasets[0].label || "Valor"}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

// Gráfico de barras
export function BarChart({ data, height = "100%" }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data.labels.map((label: string, index: number) => ({
          name: label,
          value: data.datasets[0].data[index],
        }))}
        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
        />
        <YAxis 
          width={40}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value}`, data.datasets[0].label || "Valor"]}
          labelFormatter={(label) => `${label}`}
          contentStyle={{ 
            backgroundColor: "white", 
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "none",
            padding: "8px 12px",
          }}
        />
        <Bar
          dataKey="value"
          fill={data.datasets[0].backgroundColor || "#6366f1"}
          radius={[4, 4, 0, 0]}
          name={data.datasets[0].label || "Valor"}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// Gráfico de pizza/torta
export function PieChart({ data, height = "100%" }: ChartProps) {
  const chartData = data.labels.map((label: string, index: number) => ({
    name: label,
    value: data.datasets[0].data[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell 
              key={`cell-${index}`} 
              fill={data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value}`, "Quantidade"]}
          contentStyle={{ 
            backgroundColor: "white", 
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "none",
            padding: "8px 12px",
          }}
        />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}