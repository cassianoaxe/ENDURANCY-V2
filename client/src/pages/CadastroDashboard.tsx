import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChartBar, Users, Building2, Calendar, Settings } from "lucide-react";

export default function CadastroDashboard() {
  // Navegação direta para a página de cadastro
  const navigateBack = () => {
    window.location.href = '/cadastro';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard de Cadastro</h1>
          <p className="text-gray-600">Visão geral das métricas e atividades de cadastro</p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="mb-6 gap-2" 
        onClick={navigateBack}
      >
        <ArrowLeft size={16} />
        Voltar para Cadastro
      </Button>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Total de Organizações</CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">127</p>
            <p className="text-sm text-muted-foreground">+12 no último mês</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Usuários Ativos</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">542</p>
            <p className="text-sm text-muted-foreground">+85 no último mês</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Taxa de Conversão</CardTitle>
              <ChartBar className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">68%</p>
            <p className="text-sm text-muted-foreground">+5% comparado ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de registros recentes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-slate-50 rounded flex items-center justify-center">
            <p className="text-muted-foreground">Gráfico de registros dos últimos 30 dias</p>
          </div>
        </CardContent>
      </Card>

      {/* Atividades recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="bg-primary/10 p-2 rounded">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Nova organização registrada</p>
                <p className="text-sm text-muted-foreground">Associação Cultural Verde Vida</p>
                <p className="text-xs text-muted-foreground">Hoje, 10:25</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="bg-primary/10 p-2 rounded">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Atualização de configuração</p>
                <p className="text-sm text-muted-foreground">Campos personalizados adicionados para empresas</p>
                <p className="text-xs text-muted-foreground">Ontem, 15:40</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="bg-primary/10 p-2 rounded">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Novos usuários aprovados</p>
                <p className="text-sm text-muted-foreground">5 usuários aprovados para acesso ao sistema</p>
                <p className="text-xs text-muted-foreground">Ontem, 11:20</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Evento de cadastro agendado</p>
                <p className="text-sm text-muted-foreground">Webinar de orientação para novas organizações</p>
                <p className="text-xs text-muted-foreground">29/04/2025, 14:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}