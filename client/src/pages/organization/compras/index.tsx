'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Package2 } from "lucide-react";
import NovaSolicitacaoDialog from "@/components/compras/NovaSolicitacaoDialog";
import VolumeComprasChart from "@/components/compras/VolumeComprasChart";
import SolicitacoesPorStatusChart from "@/components/compras/SolicitacoesPorStatusChart";

export default function ComprasDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Compras</h1>
          <p className="text-muted-foreground">
            Visão geral das solicitações de compra, fornecedores e estoque
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Este Mês
          </Button>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Package2 className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Solicitações Pendentes</p>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-bold">1</h2>
                  </div>
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    Aguardando aprovação
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Valor Total em Análise</p>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-bold">R$ 29.430,95</h2>
                  </div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                    Economia potencial: R$ 3.531,71
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Fornecedores Ativos</p>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-bold">3</h2>
                  </div>
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    Últimos 30 dias
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Itens em Estoque Crítico</p>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-bold">3</h2>
                  </div>
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-600" />
                    Ação recomendada
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Volume de Compras</CardTitle>
                <CardDescription>Total de compras nos últimos 7 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <VolumeComprasChart />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Solicitações por Status</CardTitle>
                <CardDescription>Distribuição de solicitações por status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SolicitacoesPorStatusChart />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="solicitacoes">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Recentes</CardTitle>
              <CardDescription>Lista das solicitações de compra recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Conteúdo da aba Solicitações será implementado em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque">
          <Card>
            <CardHeader>
              <CardTitle>Estoque Atual</CardTitle>
              <CardDescription>Itens em estoque e status atual</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Conteúdo da aba Estoque será implementado em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores Cadastrados</CardTitle>
              <CardDescription>Lista de fornecedores e suas avaliações</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Conteúdo da aba Fornecedores será implementado em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NovaSolicitacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}