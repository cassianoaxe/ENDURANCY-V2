"use client";
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Calendar, CalendarDays, Clock, FileText, Scale } from "lucide-react";
import { Button } from '@/components/ui/button';

// Dados fictícios para visualização
const acoesData = [
  { status: 'Em andamento', valor: 22, cor: '#3B82F6' },
  { status: 'Procedentes', valor: 54, cor: '#10B981' },
  { status: 'Procedentes Parcial', valor: 8, cor: '#F59E0B' },
  { status: 'Improcedentes', valor: 16, cor: '#EF4444' }
];

const evolucaoMensalData = [
  { mes: 'Jan', acoesNovas: 5, liminares: 3, acoesGanhas: 2 },
  { mes: 'Fev', acoesNovas: 8, liminares: 5, acoesGanhas: 3 },
  { mes: 'Mar', acoesNovas: 12, liminares: 8, acoesGanhas: 5 },
  { mes: 'Abr', acoesNovas: 15, liminares: 10, acoesGanhas: 7 },
  { mes: 'Mai', acoesNovas: 10, liminares: 7, acoesGanhas: 4 },
  { mes: 'Jun', acoesNovas: 20, liminares: 14, acoesGanhas: 12 }
];

const proximasAudiencias = [
  {
    id: 1,
    tipo: 'Conciliação',
    processo: '0123456-78.2023.8.26.0100',
    cliente: 'Ana Maria Silva',
    data: '14/08/2023'
  }
];

const prazosProximos = [
  {
    id: 1,
    tipo: 'Manifestação sobre laudo pericial',
    processo: '0123456-78.2023.8.26.0100',
    prazo: '09/08/2023',
    diasRestantes: 3
  }
];

export default function DashboardJuridico() {
  const [filtroTempo, setFiltroTempo] = useState("Mensal");

  // Calcular totais
  const totalAcoes = acoesData.reduce((acc, item) => acc + item.valor, 0);
  const totalProcedentes = acoesData.find(item => item.status === 'Procedentes')?.valor || 0;
  const totalLiminares = 42; // Valor fixo do exemplo
  const totalAudiencias = 5; // Valor fixo do exemplo

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Dashboard Jurídico</h1>
        </div>
        <div className="flex gap-4">
          <Select value={filtroTempo} onValueChange={setFiltroTempo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Diário">Diário</SelectItem>
              <SelectItem value="Semanal">Semanal</SelectItem>
              <SelectItem value="Mensal">Mensal</SelectItem>
              <SelectItem value="Trimestral">Trimestral</SelectItem>
              <SelectItem value="Anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Filtros</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm0 0V.5m0 5.5v6.5m4-6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm0 0V.5m0 5.5v6.5" stroke="currentColor" />
            </svg>
          </Button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">Acompanhe todos os indicadores das ações judiciais</p>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold">{totalAcoes}</div>
            <p className="text-sm text-gray-500 mt-1">Total de Ações</p>
            <div className="flex items-center mt-2 text-emerald-600">
              <FileText className="h-4 w-4 mr-1" />
              <span className="text-xs">Acompanhamento ativo</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold">{totalProcedentes}</div>
            <p className="text-sm text-gray-500 mt-1">Ações Procedentes</p>
            <div className="flex items-center mt-2 text-emerald-600">
              <span className="text-xs">Taxa de Êxito: 69%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold">{totalLiminares}</div>
            <p className="text-sm text-gray-500 mt-1">Liminares Concedidas</p>
            <div className="flex items-center mt-2 text-emerald-600">
              <span className="text-xs">Taxa: 65%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold">{totalAudiencias}</div>
            <p className="text-sm text-gray-500 mt-1">Próximas Audiências</p>
            <div className="flex items-center mt-2 text-amber-600">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span className="text-xs">Próximos 7 dias</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ações por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={acoesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={1}
                    dataKey="valor"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {acoesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {acoesData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.cor }}></div>
                  <span className="text-xs text-gray-600">{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evolucaoMensalData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="acoesNovas" name="Ações Novas" fill="#9b82f3" />
                  <Bar dataKey="liminares" name="Liminares" fill="#10B981" />
                  <Bar dataKey="acoesGanhas" name="Ações Ganhas" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Próximas audiências e prazos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Audiências</CardTitle>
          </CardHeader>
          <CardContent>
            {proximasAudiencias.length > 0 ? (
              <div className="space-y-4">
                {proximasAudiencias.map((audiencia) => (
                  <div key={audiencia.id} className="flex items-start p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full mr-4">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{audiencia.tipo}</h4>
                      <p className="text-sm text-gray-600">Processo: {audiencia.processo}</p>
                      <p className="text-sm text-gray-600">Cliente: {audiencia.cliente}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="font-bold text-gray-800">{audiencia.data}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">Nenhuma audiência agendada para os próximos dias</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Prazos Próximos</CardTitle>
          </CardHeader>
          <CardContent>
            {prazosProximos.length > 0 ? (
              <div className="space-y-4">
                {prazosProximos.map((prazo) => (
                  <div key={prazo.id} className="flex items-start p-4 bg-amber-50 rounded-lg">
                    <div className="flex-shrink-0 bg-amber-100 p-3 rounded-full mr-4">
                      <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{prazo.tipo}</h4>
                      <p className="text-sm text-gray-600">Processo: {prazo.processo}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="font-bold text-gray-800">{prazo.prazo}</span>
                      <div className="inline-block ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {prazo.diasRestantes} dias
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">Nenhum prazo iminente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}