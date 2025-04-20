"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar,
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const barChartData = [
  { name: 'Jan', valor: 4000 },
  { name: 'Fev', valor: 3000 },
  { name: 'Mar', valor: 2000 },
  { name: 'Abr', valor: 2780 },
  { name: 'Mai', valor: 1890 },
  { name: 'Jun', valor: 2390 },
];

const areaChartData = [
  { name: 'Jan', cbd: 1500, thc: 400 },
  { name: 'Fev', cbd: 2300, thc: 600 },
  { name: 'Mar', cbd: 2100, thc: 500 },
  { name: 'Abr', cbd: 2800, thc: 700 },
  { name: 'Mai', cbd: 3500, thc: 900 },
  { name: 'Jun', cbd: 3000, thc: 800 },
];

const pieChartData = [
  { name: 'CBD', value: 65 },
  { name: 'THC', value: 15 },
  { name: 'Outros Canabinoides', value: 20 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

export function DashboardPreview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-3 md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Análises por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="valor" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3 md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Concentração de Canabinoides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaChartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="cbd" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="thc" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3 md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Distribuição de Compostos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}