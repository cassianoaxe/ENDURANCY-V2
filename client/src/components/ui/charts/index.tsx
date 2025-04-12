import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Tipos para os componentes de gráficos
type ChartProps = {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number;
};

type PieChartProps = {
  data: any[];
  index: string;
  category: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number;
};

// Função para obter cor baseada em índice ou configuração
const getColor = (idx: number, colors?: string[]) => {
  const defaultColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  if (colors && colors[idx]) {
    if (colors[idx] === "primary") return "hsl(var(--primary))";
    if (colors[idx] === "secondary") return "hsl(var(--secondary))";
    if (colors[idx] === "accent") return "hsl(var(--accent))";
    return colors[idx];
  }

  return defaultColors[idx % defaultColors.length];
};

// Componente para formatação de tooltip
const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Gráfico de Barras
export const BarChart = ({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => String(value),
  height = 300,
}: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={index}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          content={<CustomTooltip valueFormatter={valueFormatter} />}
          cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
        />
        <Legend />
        {categories.map((category, idx) => (
          <Bar
            key={category}
            dataKey={category}
            fill={getColor(idx, colors)}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Gráfico de Linhas
export const LineChart = ({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => String(value),
  height = 300,
}: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={index}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          content={<CustomTooltip valueFormatter={valueFormatter} />}
        />
        <Legend />
        {categories.map((category, idx) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={getColor(idx, colors)}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// Gráfico de Pizza
export const PieChart = ({
  data,
  index,
  category,
  colors,
  valueFormatter = (value) => String(value),
  height = 300,
}: PieChartProps) => {
  const totalValue = data.reduce((sum, entry) => sum + entry[category], 0);

  // Renderização do label customizado
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Mostrar rótulos apenas para fatias com percentual significativo
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="text-sm font-medium">{data[index]}</p>
          <p className="text-xs">
            {valueFormatter(data[category])} ({((data[category] / totalValue) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={getColor(idx, colors)} />
          ))}
        </Pie>
        <Legend />
        <Tooltip content={<CustomTooltipPie />} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// Componente de métrica simples
interface MetricProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const Metric = ({ title, value, description, icon, trend }: MetricProps) => {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{value}</p>
        {trend && (
          <span
            className={`ml-2 text-xs font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};