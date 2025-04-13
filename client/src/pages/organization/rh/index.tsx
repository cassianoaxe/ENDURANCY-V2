'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User, Users, FileText, Calendar, BarChart3, Briefcase, FilePlus, PieChart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColaboradoresTable } from "@/components/rh/ColaboradoresTable";
import { VagasAbertas } from "@/components/rh/VagasAbertas";
import { EvolutionChart } from "@/components/rh/EvolutionChart";
import { DepartmentChart } from "@/components/rh/DepartmentChart";
import { ColaboradoresRecentes } from "@/components/rh/ColaboradoresRecentes";

export default function DashboardRH() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("Último Mês");

  const cardStats = [
    {
      title: "Total de Colaboradores",
      value: "32",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      detail: "3 novos este mês",
      detailColor: "text-blue-500",
    },
    {
      title: "Vagas Abertas",
      value: "5",
      icon: <Briefcase className="h-5 w-5 text-green-500" />,
      detail: "3 novas nos últimos 30 dias",
      detailColor: "text-green-500",
    },
    {
      title: "Candidatos em Análise",
      value: "18",
      icon: <User className="h-5 w-5 text-orange-500" />,
      detail: "5 em fase de entrevista",
      detailColor: "text-orange-500",
    },
    {
      title: "Documentos Pendentes",
      value: "7",
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      detail: "3 de alta prioridade",
      detailColor: "text-purple-500",
    },
    {
      title: "Aniversários do Mês",
      value: "2",
      icon: <Calendar className="h-5 w-5 text-red-500" />,
      detail: "Próximo: João (12/08)",
      detailColor: "text-red-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard RH</h1>
          <p className="text-muted-foreground">
            Gestão de colaboradores, recrutamento e documentação
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Última Semana">Última Semana</SelectItem>
              <SelectItem value="Último Mês">Último Mês</SelectItem>
              <SelectItem value="Último Trimestre">Último Trimestre</SelectItem>
              <SelectItem value="Último Ano">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Indicadores de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cardStats.map((stat, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold mt-1 mb-2">{stat.value}</h3>
                  <p className={`text-xs ${stat.detailColor}`}>
                    {stat.detail}
                  </p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Evolução de Colaboradores</CardTitle>
            <CardDescription>Admissões, desligamentos e total mensal</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <EvolutionChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Colaboradores por Departamento</CardTitle>
            <CardDescription>Distribuição atual da equipe</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <DepartmentChart />
          </CardContent>
        </Card>
      </div>

      {/* Tabelas e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Colaboradores Recentes</CardTitle>
                <CardDescription>Últimas contratações</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ColaboradoresRecentes />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Vagas Abertas</CardTitle>
                <CardDescription>Processos seletivos em andamento</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <VagasAbertas />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}