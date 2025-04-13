'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dados mockados para demonstração
const DATA_RECEITAS = [
  { nome: 'Vendas', valor: 45000, porcentagem: 60, cor: '#0ea5e9' },
  { nome: 'Serviços', valor: 15000, porcentagem: 20, cor: '#10b981' },
  { nome: 'Investimentos', valor: 7500, porcentagem: 10, cor: '#8b5cf6' },
  { nome: 'Outros', valor: 7500, porcentagem: 10, cor: '#f59e0b' },
];

const DATA_DESPESAS = [
  { nome: 'Pessoal', valor: 35000, porcentagem: 50, cor: '#ef4444' },
  { nome: 'Insumos', valor: 14000, porcentagem: 20, cor: '#f97316' },
  { nome: 'Aluguel', valor: 7000, porcentagem: 10, cor: '#a855f7' },
  { nome: 'Impostos', valor: 7000, porcentagem: 10, cor: '#6366f1' },
  { nome: 'Outros', valor: 7000, porcentagem: 10, cor: '#ec4899' },
];

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

interface GraficoPorCategoriaProps {
  titulo: string;
  tipoInicial?: 'receitas' | 'despesas';
}

export default function GraficoPorCategoria({ titulo, tipoInicial = 'receitas' }: GraficoPorCategoriaProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<'receitas' | 'despesas'>(tipoInicial);
  const dados = tipoSelecionado === 'receitas' ? DATA_RECEITAS : DATA_DESPESAS;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {titulo}
        </CardTitle>
        <div>
          <Select
            value={tipoSelecionado}
            onValueChange={(value) => setTipoSelecionado(value as 'receitas' | 'despesas')}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receitas">Receitas</SelectItem>
              <SelectItem value="despesas">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={300}>
              <Pie
                data={dados}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="valor"
                label={({ nome, porcentagem }) => `${nome}: ${porcentagem}%`}
              >
                {dados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatter.format(Number(value))}
                contentStyle={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}