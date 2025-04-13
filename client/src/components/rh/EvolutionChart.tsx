'use client';

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Jan",
    novos: 2,
    saidas: 0,
    total: 24,
  },
  {
    name: "Fev",
    novos: 1,
    saidas: 1,
    total: 24,
  },
  {
    name: "Mar",
    novos: 3,
    saidas: 0,
    total: 27,
  },
  {
    name: "Abr",
    novos: 0,
    saidas: 1,
    total: 26,
  },
  {
    name: "Mai",
    novos: 1,
    saidas: 0,
    total: 27,
  },
  {
    name: "Jun",
    novos: 0,
    saidas: 0,
    total: 27,
  },
  {
    name: "Jul",
    novos: 3,
    saidas: 0,
    total: 30,
  },
];

export function EvolutionChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
        <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "none",
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="novos" name="Novos" fill="#82ca9d" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="left" dataKey="saidas" name="Saídas" fill="#ff8c7a" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="total" name="Total" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}