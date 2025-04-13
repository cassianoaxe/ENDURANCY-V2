'use client';

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import NovaTarefaDialog from "@/components/tarefas/NovaTarefaDialog";
import { cn } from "@/lib/utils";

export default function MinhasTarefas() {
  const [dialogNovaTarefaAberto, setDialogNovaTarefaAberto] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState<string>("todas");
  const [termoBusca, setTermoBusca] = useState<string>("");

  const filtros = [
    { id: "todas", label: "Todas" },
    { id: "atrasadas", label: "Atrasadas" },
    { id: "proximaVencimento", label: "Prazo Próximo" },
    { id: "emProgresso", label: "Em Progresso" },
    { id: "concluidas", label: "Concluídas" }
  ];

  // Aqui seria a lógica para buscar as tarefas do usuário atual da API

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tarefas..."
                className="pl-8 w-64"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setDialogNovaTarefaAberto(true)} 
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total de Tarefas</span>
                <span className="text-3xl font-bold mt-1">0</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Tarefas Pendentes</span>
                <span className="text-3xl font-bold mt-1">0</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Em Progresso</span>
                <span className="text-3xl font-bold mt-1 text-purple-600">0</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Atrasadas</span>
                <span className="text-3xl font-bold mt-1 text-red-600">0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-2 border-b">
          {filtros.map((filtro) => (
            <Button
              key={filtro.id}
              variant="ghost"
              className={cn(
                "rounded-none border-b-2 border-transparent",
                filtroAtivo === filtro.id && "border-primary text-primary"
              )}
              onClick={() => setFiltroAtivo(filtro.id)}
            >
              {filtro.label}
            </Button>
          ))}
        </div>

        <div className="min-h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhuma tarefa encontrada
        </div>
      </div>

      <NovaTarefaDialog 
        open={dialogNovaTarefaAberto} 
        onOpenChange={setDialogNovaTarefaAberto} 
      />
    </>
  );
}