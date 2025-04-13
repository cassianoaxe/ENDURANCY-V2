'use client';

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Produção", value: 10, color: "#4ade80" },
  { name: "Cultivo", value: 8, color: "#60a5fa" },
  { name: "Qualidade", value: 6, color: "#f97316" },
  { name: "P&D", value: 3, color: "#8b5cf6" },
  { name: "Marketing", value: 2, color: "#ec4899" },
  { name: "Administrativo", value: 3, color: "#f59e0b" },
];

export function DepartmentChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} colaboradores`, "Quantidade"]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "none",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}