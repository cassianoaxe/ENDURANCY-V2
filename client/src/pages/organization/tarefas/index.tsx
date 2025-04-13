'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import TarefasStatusCard from "@/components/tarefas/TarefasStatusCard";
import TarefasPorStatusChart from "@/components/tarefas/TarefasPorStatusChart";
import TarefasPorPrioridadeChart from "@/components/tarefas/TarefasPorPrioridadeChart";
import NovaTarefaDialog from "@/components/tarefas/NovaTarefaDialog";

export default function DashboardTarefas() {
  const [dialogNovaTarefaAberto, setDialogNovaTarefaAberto] = useState(false);

  // Dados mockados para os gráficos
  const dadosPorStatus = [
    { status: 'Backlog', quantidade: 0, cor: '#94a3b8' },
    { status: 'Todo', quantidade: 0, cor: '#3b82f6' },
    { status: 'In_progress', quantidade: 0, cor: '#8b5cf6' },
    { status: 'Review', quantidade: 0, cor: '#f59e0b' },
    { status: 'Done', quantidade: 0, cor: '#10b981' }
  ];

  const dadosPorPrioridade = [
    { prioridade: 'Low', quantidade: 0, cor: '#94a3b8' },
    { prioridade: 'Medium', quantidade: 0, cor: '#3b82f6' },
    { prioridade: 'High', quantidade: 0, cor: '#f59e0b' },
    { prioridade: 'Urgent', quantidade: 0, cor: '#ef4444' }
  ];

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Tarefas</h1>
            <p className="text-muted-foreground">
              Visão geral de todas as suas tarefas e estatísticas
            </p>
          </div>
          <Button 
            onClick={() => setDialogNovaTarefaAberto(true)} 
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TarefasStatusCard 
            titulo="Total de Tarefas" 
            quantidade={0} 
            tipo="total" 
          />
          <TarefasStatusCard 
            titulo="Em Progresso" 
            quantidade={0} 
            tipo="emProgresso" 
          />
          <TarefasStatusCard 
            titulo="Tarefas Atrasadas" 
            quantidade={0} 
            tipo="atrasadas" 
          />
          <TarefasStatusCard 
            titulo="Concluídas" 
            quantidade={0} 
            tipo="concluidas" 
            periodo="7 dias" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TarefasPorStatusChart 
            data={dadosPorStatus} 
            titulo="Tarefas por Status" 
          />
          
          <TarefasPorPrioridadeChart 
            data={dadosPorPrioridade} 
            titulo="Tarefas por Prioridade" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Recentemente Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma tarefa concluída recentemente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma tarefa com vencimento próximo
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <NovaTarefaDialog 
        open={dialogNovaTarefaAberto} 
        onOpenChange={setDialogNovaTarefaAberto} 
      />
    </OrganizationLayout>
  );
}