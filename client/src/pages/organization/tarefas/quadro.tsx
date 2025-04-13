'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import NovaTarefaDialog from "@/components/tarefas/NovaTarefaDialog";
import { StatusTarefa } from '@shared/schema-tarefas';

// Componente para cada coluna do quadro Kanban
interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  children?: React.ReactNode;
}

function KanbanColumn({ title, count, color, children }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <div 
        className="p-3 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: color }}
      >
        <h3 className="font-medium text-white">{title}</h3>
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20 text-white text-xs font-medium">
          {count}
        </div>
      </div>
      <div className="flex-1 p-2 bg-slate-50 rounded-b-lg">
        {children || (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Não há tarefas
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuadroKanban() {
  const [dialogNovaTarefaAberto, setDialogNovaTarefaAberto] = useState(false);

  // Configuração das colunas do quadro
  const columns = [
    { 
      id: StatusTarefa.BACKLOG, 
      title: 'Backlog', 
      count: 0, 
      color: '#1e293b' 
    },
    { 
      id: StatusTarefa.TODO, 
      title: 'A Fazer', 
      count: 0, 
      color: '#4f46e5' 
    },
    { 
      id: StatusTarefa.IN_PROGRESS, 
      title: 'Em Progresso', 
      count: 0, 
      color: '#8b5cf6' 
    },
    { 
      id: StatusTarefa.REVIEW, 
      title: 'Revisão', 
      count: 0, 
      color: '#f59e0b' 
    },
    { 
      id: StatusTarefa.DONE, 
      title: 'Concluídas', 
      count: 0, 
      color: '#10b981' 
    }
  ];

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quadro de Tarefas</h1>
          </div>
          <Button 
            onClick={() => setDialogNovaTarefaAberto(true)} 
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-220px)]">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              count={column.count}
              color={column.color}
            />
          ))}
        </div>
      </div>

      <NovaTarefaDialog 
        open={dialogNovaTarefaAberto} 
        onOpenChange={setDialogNovaTarefaAberto} 
      />
    </>
  );
}